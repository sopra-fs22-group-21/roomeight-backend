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

    addUserProfile(first_name: string, last_name: string, description: string, biography: string, tags: string, picture_reference: string,
                   matches: string, creation_date: string, online_status: string, birthday: string, email_address: string,
                   phoneNumber: string, gender: string, is_searching_room: string, is_advertising_room: string,
                   move_in_date: string, move_out_date: string) {
        try {
            addDoc(collection(this.database, this.collection_name), {
                ProfileType: "User",
                FirstName: first_name,
                LastName: last_name,
                Description: description,
                Biography: biography,
                Tags: tags,
                PictureReference: picture_reference,
                Matches: matches,
                CreationDate: creation_date,
                OnlineStatus: online_status,
                Birthday: birthday,
                EmailAddress: email_address,
                PhoneNumber: phoneNumber,
                Gender: gender,
                IsSearchingRoom: is_searching_room,
                IsAdvertisingRoom: is_advertising_room,
                MoveInDate: move_in_date,
                MoveOutDate: move_out_date
            }).then(
                r => console.log("User profile document written")
            );
        } catch (e) {
            console.error("Error during adding user profile document to firestore: ", e);
        }
    }
}

