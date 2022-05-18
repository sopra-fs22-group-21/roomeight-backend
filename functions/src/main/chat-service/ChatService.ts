import * as functions from "firebase-functions";
import { MessageData, Updates } from "../../assets/Types";
import { ExpoPushClient } from "../clients/ExpoPushClient";
import { ChatRepository } from "../repository/ChatRepository";
import { UserRepository } from "../repository/UserRepository";

export class ChatService {
  private chat_repository: ChatRepository;
  private user_repository: UserRepository;
  private expoPushClient: ExpoPushClient;

  constructor(user_repo: UserRepository, chat_repo: ChatRepository) {
    this.chat_repository = chat_repo;
    this.user_repository = user_repo;
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
   * executed whenever a new child of /chats is created, updates the /memberships
   * @param snapshot
   * @param context
   */
  async onChatCreate(snapshot: functions.database.DataSnapshot, context: functions.EventContext){
    const chatId = context.params.chatId;
    const chatInfo = snapshot.val();
    const members = Object.keys(chatInfo.members);
    await this.chat_repository.addMemberships(chatId, members);
  }

}
