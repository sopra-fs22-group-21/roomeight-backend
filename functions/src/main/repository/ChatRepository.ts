import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { ChatInfo, MessageData, Updates } from "../../assets/Types";

export class ChatRepository {
  private database: admin.database.Database;
  private chats_ref: admin.database.Reference;
  private memberships_ref: admin.database.Reference;
  private messages_ref: admin.database.Reference;

  constructor(app: admin.app.App) {
    this.database = admin.database(app);
    this.chats_ref = this.database.ref("/chats");
    this.messages_ref = this.database.ref("/messages");
    this.memberships_ref = this.database.ref("/memberships");
  }

  async addMessage(chatId: string, message: MessageData) {
    return this.messages_ref.child(chatId).child(message._id).set(message);
  }

  async removeMessages(chatId: string) {
    return this.messages_ref.child(chatId).remove();
  }

  /**
   * Updates attributes in the db /chats/chatId
   * @param chatId
   * @param data
   */
  async updateChatInfo(chatId: string, data: Updates | null) {
    if (data === null) {
      return this.chats_ref.child(chatId).remove();
    } else {
      return this.chats_ref.child(chatId).update(data);
    }
  }

  async getChatInfo(chatId: string): Promise<ChatInfo> {
    return (await this.chats_ref.child(chatId).once("value")).val();
  }

  /**
   * Returns a list of all memberIds of a chat
   * @param chatId the id of the chat to fetch the members from
   * @returns string[] the list of memberIds
   */
  async getMembers(chatId: string): Promise<string[]> {
    const snapshot = await this.chats_ref
      .child(chatId)
      .child("members")
      .once("value");
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    } else {
      return [];
    }
  }

  async removeMemberships(chatId: any, members: string[]) {
    const data: Updates = {};
    for (let member of members) {
      data[`${member}/${chatId}`] = null;
    }
    functions.logger.info("membership deletion: ", data);
    return this.memberships_ref.update(data);
  }

  /**
   * adds the chatId to all new members of a chat
   * @param chatId the newly created chat
   * @param members the members that should be added
   */
  async addMemberships(chatId: string, profileId: string, members: string[]) {
    const data: Updates = {};
    for (let member of members) {
      data[`${member}/${chatId}`] = profileId;
    }
    functions.logger.info("membership update: ", data);
    return this.memberships_ref.update(data);
  }
  
  async getMemberships(userId: string): Promise<string[] | null> {
    const snapshot = await this.memberships_ref.child(userId).once("value");
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    } else {
      return null;
    }
  }

  async getMembershipValues(userId: string): Promise<string[] | null> {
    const snapshot = await this.memberships_ref.child(userId).once("value");
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    } else {
      return null;
    }
  }
}
