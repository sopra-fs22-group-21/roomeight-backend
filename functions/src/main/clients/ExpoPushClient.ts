import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import * as functions from 'firebase-functions';
import { MessageData } from '../../assets/Types';

export class ExpoPushClient {
    private client: Expo;

    constructor(){
        this.client = new Expo()
    }

    private verifyPushTokens(tokens: string[]): boolean {
        for (const token of tokens) {
            if (!Expo.isExpoPushToken(token)) {
              console.error(`Push token ${token} is not a valid Expo push token`);
              return false;
            }
        }
        return true;
    };

    pushToClients(recepients: string[], data: MessageData){
        if(!this.verifyPushTokens(recepients)){
            return;
        };
        let messages: ExpoPushMessage[] = [];
        recepients.forEach(recepient => {
            messages.push({
                to: recepient,
                ...data,
            });
        });
        let chunks = this.client.chunkPushNotifications(messages);
        let tickets:ExpoPushTicket[] = [];
        (async () => {
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await this.client.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);
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
        })
    }
        



}