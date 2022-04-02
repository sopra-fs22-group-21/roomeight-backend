import {Repository} from "../repository/Repository";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {UserProfile} from "../data-model/UserProfile";

export class UserProfileDataService {

    static addUserProfile(body: any) {
        const repository = new Repository();
        const current_date = new Date().getDate().toString();
        const auth = getAuth();

        let user_to_add = new UserProfile(body.FirstName, body.LastName, body.Description, body.Biography, body.Tags,
                                          body.PictureReference, body.Matches, current_date, body.OnlineStatus,
                                          body.MoveInDate, body.MoveOutDate, body.Birthday, body.EmailAddress,
                                          body.PhoneNumber, body.Gender, body.IsSearchingRoom, body.IsAdvertisingRoom)

        console.log(body.IsSearchingRoom)
        console.log(user_to_add)
        repository.addUserProfile(user_to_add.toJson());

        createUserWithEmailAndPassword(auth, body.EmailAddress, body.Password)
    }

}
