import {getFirestore, doc, setDoc, deleteDoc} from "firebase/firestore";
import {initializeApp} from "firebase/app"
import {config} from "../../firebase_config";
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
        const doc_reference = doc(this.database, this.collection_name, profileId);
        return deleteDoc(doc_reference)
            .then(() => {
                return "Successfully deleted User with id: " + profileId;
    })
    }

}

