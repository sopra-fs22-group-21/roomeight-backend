import * as functions from "firebase-functions";
import {UserProfile} from "../data-model/UserProfile";
// Testing import for admin auth
//import {getFirestore} from "firebase-admin/lib/firestore";
// Prod import for admin auth
import {getFirestore} from "firebase-admin/firestore";
import {app} from "firebase-admin";
import App = app.App;
import {ProfileQueryRepository} from "./ProfileQueryRepository";

export class UserRepository implements ProfileQueryRepository {
    database: any;
    collection_name: string;


    constructor(app: App) {
        this.database = getFirestore(app);
        this.collection_name = "user-profiles"
    }

    // Firestore User Operations

    getProfileById(profile_id:string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).get()
            .then((response: any) => {
                return response
            })
    }

    addUserProfile(user_to_add: UserProfile): Promise<string>  {
        // Add user to database with set unique profile id
        functions.logger.debug(user_to_add.toJson(), {structuredData: true})
        return this.database.collection(this.collection_name).doc(user_to_add.profileId).set(user_to_add.toJson())
                .then((response: any) => {
                        return response;
                    });
    }

    updateUserProfile(update_fields: any, profile_id: string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).update(update_fields)
            .then(() => {
                return "Successfully updated User with id: " + profile_id;
            });
    }
    
    deleteUserProfile(profile_id: string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).delete()
            .then(() => {
                return "Successfully deleted User with id: " + profile_id;
        });
    }

}

