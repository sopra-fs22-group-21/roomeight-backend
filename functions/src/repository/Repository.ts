import {getFirestore} from "firebase/firestore";
import {initializeApp} from "firebase/app"
import {config} from "../../firebase_config";
import {firestore} from "firebase-admin";
import DocumentData = firestore.DocumentData;
import QuerySnapshot = firestore.QuerySnapshot;

export class Repository {
    database: any;
    collection_name: string;

    constructor() {
        const app = initializeApp(config);
        this.database = getFirestore(app);
        this.collection_name = "profiles"
    }

    // Firestore User Operations

    addUserProfile(user_to_add: any): Promise<string>  {
        return this.database.collection(this.collection_name).doc(user_to_add.profileId).set(user_to_add)
                .then(
                    (r: any) => {
                        return r.id;
                    }
                )
    }

    deleteUserProfile(email_address: string): Promise<string> {
        let query = this.database.collection(this.collection_name).where('EmailAddress','==', email_address);
        return query.get()
            .then( (query_result: QuerySnapshot<DocumentData>) => {
                query_result.forEach((doc) => {
                    doc.ref.delete().then(() => {
                            return "Successfully deleted User with email: " + email_address;
                        }
                    );
                });
            }
        );
    }

}

