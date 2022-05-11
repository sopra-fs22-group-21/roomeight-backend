import * as admin from "firebase-admin";
import { Updates } from "../../assets/Types";

export class ChatRepository {
  private database: admin.database.Database;
  private chats_ref: admin.database.Reference;

  constructor(app: admin.app.App) {
    this.database = admin.database(app);
    this.chats_ref = this.database.ref("/chats");
  }

  updateChatInfo(chatId: string, data: Updates) {
    return this.chats_ref.child(chatId).update(data);
  }

  /**
   * Returns a list of all memberIds of a chat
   * @param chatId the id of the chat to fetch the members from
   * @returns string[] the list of memberIds
   */
  async getMembers(chatId: string): Promise<string[]> {
    const snaphot = await this.chats_ref
          .child(chatId)
          .child("members")
          .once("value");
      if (snaphot.exists()) {
          return Object.keys(snaphot.val());
      } else {
          return [];
      }
  }
}
