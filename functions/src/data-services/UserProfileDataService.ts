import {Repository} from "../repository/Repository";
import {createUserWithEmailAndPassword, deleteUser, getAuth} from "firebase/auth";
import {UserProfile} from "../data-model/UserProfile";
import {Validator} from "../validation/Validator";
import {Status} from "../data-model/Status";

export class UserProfileDataService {

    static async addUserProfile(body: any): Promise<string> {
        // Initialize services and vars
        const repository = new Repository();
        const auth = getAuth();
        const creation_date = new Date().getDate().toString();

        // Validate user which should be added
        const validation_results = Validator.validateUser(body);

        if (!validation_results.hasErrors) {
            // Precede if validation found no errors
            let user_to_add = new UserProfile(body.FirstName, body.LastName, body.Description, body.Biography, body.Tags,
                body.PictureReference, body.Matches, creation_date, Status.online,
                body.MoveInDate, body.MoveOutDate, body.Birthday, body.EmailAddress,
                body.PhoneNumber, body.Gender, body.IsSearchingRoom, body.IsAdvertisingRoom, body.Mismatches)


            // As soon as the user object is posted into the database precede with auth user profile creation
            return createUserWithEmailAndPassword(auth, body.EmailAddress, body.Password)
                .then((userCredential) => {
                    return repository.addUserProfile(user_to_add.toJson())
                        .then((response) => {
                            return user_to_add.toJson();
                        })
                        .catch((e) => {
                            deleteUser(userCredential.user)
                                .then(() => {
                                        throw new Error("Could not post user object to firestore " +
                                                        "but could also not delete already signed up auth user");
                                    }
                                );
                            throw new Error("Error: Could not post user due to: " + e.message)
                        });
                });

        } else {
            // Throw value error with list of errors which were found if validation failed
            throw new Error(validation_results.errors.toString());
        }
    }

}
