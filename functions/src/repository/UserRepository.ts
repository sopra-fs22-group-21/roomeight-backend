import * as functions from "firebase-functions";
import {UserProfile} from "../data-model/UserProfile";
import {getFirestore} from "firebase-admin/firestore";
import {app} from "firebase-admin";
import App = app.App;

export class UserRepository {
    database: any;
    collection_name: string;


    constructor(app: App) {
        this.database = getFirestore(app);
        this.collection_name = "user-profiles"
    }

    // Firestore User Operations

    addUserProfile(user_to_add: UserProfile): Promise<string>  {
        // Add user to database with set unique profile id
        functions.logger.debug(user_to_add.toJson(), {structuredData: true})
        return this.database.collection(this.collection_name).doc(user_to_add.profileId).set(user_to_add.toJson())
                .then(
                    (r: any) => {
                        return r;
                    }
                )
    }

    // Todo: refactor as soon as p
    updateUserProfile(update_fields: any, profile_id: string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).update(update_fields)
            .then(() => {
                return "Successfully updated User with id: " + profile_id;
            })
    }
    
    deleteUserProfile(profile_id: string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).delete()
            .then(() => {
                return "Successfully deleted User with id: " + profile_id;
    })
    }

}

