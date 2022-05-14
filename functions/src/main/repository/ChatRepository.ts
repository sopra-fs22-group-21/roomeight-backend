import * as admin from "firebase-admin";
import { Updates } from "../../assets/Types";
import * as functions from "firebase-functions"

export class ChatRepository {
  private database: admin.database.Database;
  private chats_ref: admin.database.Reference;
  private memberships_ref: admin.database.Reference;

  constructor(app: admin.app.App) {
    this.database = admin.database(app);
    this.chats_ref = this.database.ref("/chats");
    this.memberships_ref = this.database.ref("/memberships");
  }

  /**
   * Updates attributes in the db /chats/chatId
   * @param chatId
   * @param data
   */
  updateChatInfo(chatId: string, data: Updates) {
    return this.chats_ref.child(chatId).update(data);
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

  /**
   * adds the chatId to all new members of a chat
   * @param chatId the newly created chat
   * @param members the members that should be added
   */
  addMemberships(chatId: any, members: string[]) {
    const data: Updates = {}
    for(let member of members){
      data[`${member}/${chatId}`] = true
    }
    functions.logger.info('membership update: ', data)
    return this.memberships_ref.update(data)
  }
}
