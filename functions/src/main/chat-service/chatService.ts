import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import { ChatInfo, MessageData, Updates } from "../../assets/Types";
import { ExpoPushClient } from "../clients/ExpoPushClient";
import { ChatRepository } from "../repository/ChatRepository";
import { FlatRepository } from "../repository/FlatRepository";
import { UserRepository } from "../repository/UserRepository";

export class chatService {
  private chat_repository: ChatRepository;
  private user_repository: UserRepository;
  private flat_repository: FlatRepository;
  private expoPushClient: ExpoPushClient;

  constructor(
    user_repo: UserRepository,
    chat_repo: ChatRepository,
    flat_repo: FlatRepository
  ) {
    this.chat_repository = chat_repo;
    this.user_repository = user_repo;
    this.flat_repository = flat_repo;
    this.expoPushClient = new ExpoPushClient();
  }

  /**
   * executed whenever a new child of /messages/chatId is created, updates the chatinfo with lastSender
   * and sends push notification to all chat members
   * @param snapshot
   * @param context
   */
  async onMessageCreate(
    snapshot: functions.database.DataSnapshot,
    context: functions.EventContext
  ) {
    const chatId: string = context.params.chatId;
    const messageId = context.params.messageId;
    functions.logger.info("New message in chat " + chatId + ": " + messageId);

    const messageData = snapshot.val();
    const text: string = messageData.text;
    const senderId: string = messageData.user._id;
    const senderName: string = messageData.user.name;

    //send push notification to all members of chat
    let message: MessageData = {
      title: "Roomeight",
      body: senderName + ": " + text,
    };
    const members = await this.chat_repository.getMembers(chatId);
    functions.logger.debug("Members: " + members);
    const recipients = members.filter((member) => member !== senderId);
    functions.logger.debug("Recipients: " + recipients);
    let expoPushTokens: string[] = [];

    for (const recipient of recipients) {
      const profile = await this.user_repository.getProfileById(recipient);
      functions.logger.debug("Profile: " + profile);
      const devicePushTokens: string[] = profile.devicePushTokens;
      expoPushTokens.push(...devicePushTokens);
    }
    functions.logger.debug("ExpoPushTokens: " + expoPushTokens);
    await this.expoPushClient.pushToClients(expoPushTokens, message);

    //update last sender and last message in chat info
    let updates: Updates = {};
    updates["/lastSender"] = senderName;
    updates["/lastMessage"] = text;
    updates["/timestamp"] = messageData.createdAt;
    await this.chat_repository.updateChatInfo(chatId, updates);
  }

  /**
   * executed whenever a new child of /chats is deleted, updates the /memberships
   * @param snapshot
   * @param context
   */
  async onChatDelete(
    snapshot: functions.database.DataSnapshot,
    context: functions.EventContext
  ) {
    const chatId = context.params.chatId;
    const chatInfo = snapshot.val();
    const members = Object.keys(chatInfo.members);
    await this.chat_repository.removeMemberships(chatId, members);
    await this.chat_repository.removeMessages(chatId);
  }

  /**
   * API endpoint for creating a new chat
   * @param profileId the Id of the profile to create a chat with
   * @param user_id
   */
  async createChat(profileId: any, user_id: string) {
    const requestProfile = await this.user_repository.getProfileById(user_id);
    const chatId = "chat-" + uuidv4();
    let flatProfile;
    let userProfile;
    const existingChatPartners = await this.chat_repository.getMembershipValues(
      user_id
    );
    if (
      existingChatPartners !== null &&
      existingChatPartners.includes(profileId)
    ) {
      throw new Error("User already has a chat with this profile");
    }

    if (profileId.startsWith("flt$")) {
      //searching user creates chat with flat
      flatProfile = await this.flat_repository.getProfileById(profileId);
      userProfile = requestProfile;
      if (!requestProfile.matches.includes(profileId)) {
        throw new Error(
          "User has not yet matched with this profile - cannot create chat"
        );
      }
    } else {
      //flat creates chat with searching user
      flatProfile = await this.flat_repository.getProfileById(
        requestProfile.flatId
      );
      if (!flatProfile.matches.includes(profileId)) {
        throw new Error(
          "Associated flat has not yet matched with this profile - cannot create chat"
        );
      }
      userProfile = await this.user_repository.getProfileById(profileId);
    }

    const members: string[] = [...flatProfile.roomMates, user_id];
    const chatInfo: ChatInfo = {
      _id: chatId,
      title: {
        forFlat: userProfile.firstName + " " + userProfile.lastName,
        forUser: flatProfile.name,
      },
      createdAt: admin.database.ServerValue.TIMESTAMP,
      flatId: flatProfile.profileId,
      userId: userProfile.profileId,
      members: {},
    };
    members.forEach((mateId) => (chatInfo["members"][mateId] = true));
    await this.chat_repository.addMemberships(chatId, profileId, members);
    await this.chat_repository.updateChatInfo(chatId, chatInfo);

    const firstMessage: MessageData = {
      text: `${requestProfile.firstName} started a chat with all of you!`,
      user: {
        _id: requestProfile.profileId,
        name: requestProfile.firstName + " " + requestProfile.lastName,
      },
    };
    await this.sendSystemMessage(chatId, firstMessage);

    return chatId;
  }

  async deleteChat(chatId: string, user_id: string) {
    const members = await this.chat_repository.getMembers(chatId);
    if (members.includes(user_id)) {
      this.chat_repository.updateChatInfo(chatId, null);
    } else {
      throw new Error(
        "User is not a member of this chat - cannot delete the chat"
      );
    }
  }

  async sendSystemMessage(chatId: string, message: MessageData) {
    const messageId = "msg-" + uuidv4();
    const messageData: MessageData = {
      ...message,
      _id: messageId,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      system: true,
    };
    return this.chat_repository.addMessage(chatId, messageData);
  }

  async onChatPresenceUpdate(
    snapshot: functions.Change<functions.database.DataSnapshot>,
    context: functions.EventContext
  ) {
    if (snapshot.before === snapshot.after) {
      return;
    }
    const userStatus = snapshot.after.val();
    const chatId = context.params.chatId;
    const userId = context.params.userId;
    const chatInfo = await this.chat_repository.getChatInfo(chatId);

    const setPresence = (type: string, status: string) => {
      let updates: Updates = {};
      updates[`/presence/${type}/status`] = status;
      updates[`/presence/${type}/lastChanged`] =
        admin.database.ServerValue.TIMESTAMP;
      return updates;
    };

    let updates: Updates = {};
    if (chatInfo.userId === userId) {
      updates = setPresence("user", userStatus);
    } else if (userStatus === "online") {
      updates = setPresence("flat", userStatus);
    } else {
      Object.keys(chatInfo.members).every((memberId) => {
        if (
          chatInfo.members[memberId] === "online" &&
          memberId !== userId &&
          memberId !== chatInfo.userId
        ) {
          updates = setPresence("flat", "online");
          return false;
        } else {
          updates = setPresence("flat", "offline");
          return true;
        }
      });
    }
    return this.chat_repository.updateChatInfo(chatId, updates);
  }
}
