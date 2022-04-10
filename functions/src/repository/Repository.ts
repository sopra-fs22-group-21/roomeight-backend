import {getFirestore, doc, setDoc} from "firebase/firestore";
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

    deleteUserProfile(profileId: string): Promise<string> {
        let query = this.database.collection(this.collection_name).where('profileId','==', profileId);
        return query.get()
            .then( (query_result: QuerySnapshot<DocumentData>) => {
                query_result.forEach((doc) => {
                    doc.ref.delete().then(() => {
                            return "Successfully deleted User with profileId: " + profileId;
                        }
                    );
                });
            }
        );
    }

}

