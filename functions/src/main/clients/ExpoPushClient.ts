import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import * as functions from 'firebase-functions';
import { MessageData } from '../../assets/Types';

export class ExpoPushClient {
    private client: Expo;

    constructor(){
        this.client = new Expo()
    }

    private static verifyPushTokens(tokens: string[]): void {
        for (const token of tokens) {
            if (!Expo.isExpoPushToken(token)) {
              console.error(`Push token ${token} is not a valid Expo push token`);
              throw new Error("invalid Push Tokens");
            }
        }
    };

    private async sendChunks(chunks: ExpoPushMessage[][]){
        let tickets:ExpoPushTicket[] = [];
        for (let chunk of chunks) {
            try {
                let ticketChunk = await this.client.sendPushNotificationsAsync(chunk);
                functions.logger.info('ticket chunk: ', ticketChunk);
                for(let ticket of ticketChunk){
                    if(ticket.status ===  'error'){
                        functions.logger.error('error in ticket: ' + ticket.details?.error);
                    }
                }
                tickets.push(...ticketChunk);
            } catch (error) {
                functions.logger.error('Error sending push notifications: ', error);
            }
        }
        return tickets;
    }

    async pushToClients(recipients: string[], data: MessageData): Promise<any>{
        ExpoPushClient.verifyPushTokens(recipients);
        let messages: ExpoPushMessage[] = [];
        recipients.forEach(recipient => {
            messages.push({
                to: recipient,
                ...data,
            });
        });
        let chunks = this.client.chunkPushNotifications(messages);
        const tickets = await this.sendChunks(chunks);
        functions.logger.info('tickets: ', tickets);
    }
}
