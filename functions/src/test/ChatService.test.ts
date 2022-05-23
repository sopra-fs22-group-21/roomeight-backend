import * as admin from "firebase-admin";
import { ChatInfo, MessageData } from "../assets/Types";
import { ChatService } from "../main/chat-service/ChatService";
import { ValidExpoPushClient } from "../main/clients/MockExpoPushClient";
import { ValidMockChatRepository } from "../main/repository/MockChatRepository";
import { ValidMockFlatRepository } from "../main/repository/MockFlatRepository";
import { ValidMockUserRepository } from "../main/repository/MockUserRepository";

/**
 * userProfiles with different attributes:
 * 'didMatch' - user has a match with other profile -> 'flt$match' createChat('flt$match', didMatch-...)
 * 'didNotMatch' - contrary
 * 'hasChat' - already has a chat with other profile
 * 'doesNotHaveChat' - contrary
 * 'FLAT' - user is part of a flat
 * 'USER' - is searching
 *
 */

// Mocks
jest.mock("uuid", () => {
  return {
    v4: jest.fn().mockImplementation(() => "1234"),
  };
});

const expoClient = new ValidExpoPushClient();

jest.mock("../main/clients/ExpoPushClient", () => {
  return {
    ExpoPushClient: jest.fn().mockImplementation(() => expoClient),
    pushToClients: jest
      .fn()
      //@ts-ignore
      .mockImplementation(() => expoClient.pushToClients(["any"], "test")),
  };
});

describe("ChatService - chat operations", () => {
  let chatservice: any;
  let user_repo: any;
  let chat_repo: any;
  let flat_repo: any;

  beforeAll(() => {
    user_repo = new ValidMockUserRepository();
    chat_repo = new ValidMockChatRepository();
    flat_repo = new ValidMockFlatRepository();
    chatservice = new ChatService(user_repo, chat_repo, flat_repo);
  });

  // createChat function
  test("1 Test invalid did not match request", async () => {
    try {
      await chatservice.createChat("flt$match", "didNotMatch");
    } catch (e: any) {
      expect(e.message).toEqual(
        "User has not yet matched with this profile - cannot create chat"
      );
    }
  });

  test("2 Test invalid already has chat request", async () => {
    try {
      await chatservice.createChat("flt$match", "didMatch-hasChat");
    } catch (e: any) {
      expect(e.message).toEqual("User already has a chat with this profile");
    }
  });

  test("3 Test invalid flat has not matched", async () => {
    try {
      await chatservice.createChat("userUID", "123-advertising");
    } catch (e: any) {
      expect(e.message).toEqual(
        "Associated flat has not yet matched with this profile - cannot create chat"
      );
    }
  });

  test("4 Test valid request", async () => {
    const spyUpdateChatInfo = jest.spyOn(chat_repo, "updateChatInfo");
    const spyAddMemberships = jest.spyOn(chat_repo, "addMemberships");
    const spySendSystemMessage = jest.spyOn(chatservice, "sendSystemMessage");
    const profileId = "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb";
    const userId = "456";
    const chatId = await chatservice.createChat(profileId, userId);
    const chatInfo: ChatInfo = {
      _id: chatId,
      title: {
        forFlat: "Mock first_name" + " " + "Mock last_name",
        forUser: "test",
      },
      createdAt: admin.database.ServerValue.TIMESTAMP,
      flatId: profileId,
      userId: "456",
      members: {
        "123-advertising": true,
        "456": "online",
      },
      presence: {
        user: {
          status: "online",
          lastChanged: admin.database.ServerValue.TIMESTAMP,
        },
      },
    };
    const firstMessage: MessageData = {
      text: `Mock first_name started a chat with all of you!`,
      user: {
        _id: userId,
        name: "Mock first_name" + " " + "Mock last_name",
      },
    };
    expect(spyUpdateChatInfo).toHaveBeenCalledWith(chatId, chatInfo);
    expect(spyAddMemberships).toHaveBeenCalledWith(chatId, userId, profileId, [
      "123-advertising",
      "456",
    ]);
    expect(spySendSystemMessage).toHaveBeenCalledWith(chatId, firstMessage);
  });

  // deleteChat function
  test("1 Test invalid user is not member of chat request", async () => {
    try {
      await chatservice.deleteChat("any", "user123");
    } catch (e: any) {
      expect(e.message).toEqual(
        "User is not a member of this chat - cannot delete the chat"
      );
    }
  });

  test("2 Test valid deleteChat request", async () => {
    const spy = jest.spyOn(chat_repo, "updateChatInfo");

    await chatservice.deleteChat("chat-id007", "hasChat");

    expect(spy).toBeCalledWith("chat-id007", null);
  });

  //sendSystemMessage function
  test("1 Test sendSystemMessage", async () => {
    const spy = jest.spyOn(chat_repo, "addMessage");
    await chatservice.sendSystemMessage("any", { test: "message" });
    expect(spy).toHaveBeenCalledWith("any", {
      test: "message",
      _id: "msg-" + "1234",
      system: true,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
  });

  //onMessageCreate function
  test("1 Test onMessageCreate function", async () => {
    const snapshot = {
      val: () => {
        return {
          text: "testText",
          user: {
            _id: "requestUser",
            name: "testName",
          },
          createdAt: 1,
        };
      },
    };
    const context = {
      params: {
        chatId: "onMessageCreateTest",
        messageId: "messageId1",
      },
    };
    const spyGetMembers = jest.spyOn(chat_repo, "getMembers");
    const spyUpdateChatInfo = jest.spyOn(chat_repo, "updateChatInfo");
    const spyGetProfileById = jest.spyOn(user_repo, "getProfileById");
    // @ts-ignore
    const spyPushToClients = jest.spyOn(expoClient, "pushToClients");
    // @ts-ignore
    await chatservice.onMessageCreate(snapshot, context);

    expect(spyGetMembers).toHaveBeenCalledWith(context.params.chatId);
    expect(spyGetProfileById).toHaveBeenCalledTimes(2);
    expect(spyPushToClients).toHaveBeenCalledWith(["expo", "expo"], {
      title: "Roomeight",
      body: "testName: testText",
    });
    const updates: any = {};
    updates["/lastSender"] = "testName";
    updates["/lastMessage"] = "testText";
    updates["/timestamp"] = 1;
    expect(spyUpdateChatInfo).toHaveBeenCalledWith(
      context.params.chatId,
      updates
    );
  });

  //onChatPresenceUpdate function
  test("1 Test onChatPresenceUpdate initator is user online", async () => {
    const snapshot = {
      before: {},
      after: {
        val: () => {
          return "online";
        },
      },
    };
    const context = {
      params: {
        chatId: "initiatorIsUser",
        userId: "initiator",
      },
    };
    const updates: any = {};
    updates["/presence/user/status"] = "online";
    updates["/presence/user/lastChanged"] =
      admin.database.ServerValue.TIMESTAMP;

    const spyUpdateChatInfo = jest.spyOn(chat_repo, "updateChatInfo");
    //@ts-ignore
    await chatservice.onChatPresenceUpdate(snapshot, context);
    expect(spyUpdateChatInfo).toHaveBeenCalledWith("initiatorIsUser", updates);
  });

  test("2 Test onChatPresenceUpdate initator is flat alone online", async () => {
    const snapshot = {
      before: {},
      after: {
        val: () => {
          return "online";
        },
      },
    };
    const context = {
      params: {
        chatId: "initiatorIsFlat",
        userId: "initiator",
      },
    };
    const updates: any = {};
    updates["/presence/flat/status"] = "online";
    updates["/presence/flat/lastChanged"] =
      admin.database.ServerValue.TIMESTAMP;

    const spyUpdateChatInfo = jest.spyOn(chat_repo, "updateChatInfo");
    //@ts-ignore
    await chatservice.onChatPresenceUpdate(snapshot, context);
    expect(spyUpdateChatInfo).toHaveBeenCalledWith("initiatorIsFlat", updates);
  });

  test("3 Test onChatPresenceUpdate initator is flat alone offline", async () => {
    const snapshot = {
      before: {},
      after: {
        val: () => {
          return "offline";
        },
      },
    };
    const context = {
      params: {
        chatId: "initiatorIsFlat",
        userId: "initiator",
      },
    };
    const updates: any = {};
    updates["/presence/flat/status"] = "online";
    updates["/presence/flat/lastChanged"] =
      admin.database.ServerValue.TIMESTAMP;

    const spyUpdateChatInfo = jest.spyOn(chat_repo, "updateChatInfo");
    //@ts-ignore
    await chatservice.onChatPresenceUpdate(snapshot, context);
    expect(spyUpdateChatInfo).toHaveBeenCalledWith("initiatorIsFlat", updates);
  });
});
