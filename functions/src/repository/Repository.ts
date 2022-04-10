import {getFirestore, doc, setDoc, updateDoc} from "firebase/firestore";
import {initializeApp} from "firebase/app"
import {config} from "../../firebase_config";
import {firestore} from "firebase-admin";
import DocumentData = firestore.DocumentData;
import QuerySnapshot = firestore.QuerySnapshot;
import * as functions from "firebase-functions";
import {UserProfile} from "../data-model/UserProfile";

export class Repository {
    database: any;
    collection_name: string;

    // Todo: Implement logic for 2 tables

    constructor() {
        const app = initializeApp(config);
        this.database = getFirestore(app);
        this.collection_name = "profiles"
    }

    // Firestore User Operations

    addUserProfile(user_to_add: UserProfile): Promise<string>  {
        // Add user to database with set unique profile id
        functions.logger.debug(user_to_add.toJson(), {structuredData: true})
        return setDoc(doc(this.database, this.collection_name, user_to_add.profileId), user_to_add.toJson())
                .then(
                    (r: any) => {
                        return r;
                    }
                )
    }

    updateUserProfile(update_fields: any, profile_id: string): Promise<string> {
        const doc_reference = doc(this.database, this.collection_name, profile_id);
        return updateDoc(doc_reference, update_fields)
            .then(() => {
                return "Successfully updated User with id: " + profile_id;
            })
    }

    deleteUserProfile(email: string): Promise<string> {
        let query = this.database.collection(this.collection_name).where('email','==', email);
        return query.get()
            .then( (query_result: QuerySnapshot<DocumentData>) => {
                query_result.forEach((doc) => {
                    doc.ref.delete().then(() => {
                            return "Successfully deleted User with email: " + email;
                        }
                    );
                });
            }
        );
    }

}

