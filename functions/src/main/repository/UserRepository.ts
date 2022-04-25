import * as functions from "firebase-functions";
import {UserProfile} from "../data-model/UserProfile";
import * as admin from 'firebase-admin';
import App = admin.app.App;
import {ProfileRepository} from "./ProfileRepository";

export class UserRepository implements ProfileRepository {
    database: any;
    collection_name: string;


    constructor(app: App) {
        this.database = admin.firestore(app);
        this.collection_name = "user-profiles"
    }

    // Firestore User Operations

    getProfiles(): Promise<any> {
        return this.database.collection(this.collection_name).where("isSearchingRoom", "==", true).get()
            .then((response: any) => {
                return response.docs.map((doc: any) => doc.data());
            });
    }

    getProfileById(profile_id:string): Promise<any> {
        return this.database.collection(this.collection_name).doc(profile_id).get()
            .then((response: any) => {
                return response.data();
            })
    }

    addProfile(user_to_add: UserProfile): Promise<string>  {
        // Add user to database with set unique profile id
        functions.logger.debug(user_to_add.toDbEntry(), {structuredData: true})
        return this.database.collection(this.collection_name).doc(user_to_add.profileId).set(user_to_add.toDbEntry())
                .then((response: any) => {
                        return response;
                    });
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        functions.logger.info(update_fields, {structuredData: true});
        return this.database.collection(this.collection_name).doc(profile_id).update(update_fields)
            .then((r: any) => {
                functions.logger.info(r, {structuredData: true});
                return "Successfully updated User with id: " + profile_id;
            });
    }
    
    deleteProfile(profile_id: string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).delete()
            .then((r: any) => {
                functions.logger.info(r, {structuredData: true});
                return "Successfully deleted User with id: " + profile_id;
        });
    }

}

