import {getFirestore} from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import {initializeApp} from "firebase/app"
import {config} from "../../firebase_config";

export class Repository {
    database: any;
    collection_name: string;

    constructor() {
        const app = initializeApp(config);
        this.database = getFirestore(app);
        this.collection_name = "profiles"
    }

    addUserProfile(user_to_add: any) {
        try {
            addDoc(collection(this.database, this.collection_name), user_to_add).then(
                r => {
                    console.log(r)
                    return r;
                }
            );
        } catch (e) {
            console.error("Error during adding user profile document to firestore: ", e);
        }
    }
}

