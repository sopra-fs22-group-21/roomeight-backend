import {Repository} from "../repository/Repository";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {UserProfile} from "../data-model/UserProfile";
import {Validator} from "../validation/Validator";

export class UserProfileDataService {

    static addUserProfile(body: any): Promise<string> {
        // Initialize services and vars
        const repository = new Repository();
        const auth = getAuth();
        const creation_date = new Date().getDate().toString();

        // Validate user which should be added
        const validation_results = Validator.validateUser(body.toString());

        if (!validation_results.hasErrors) {
            // Precede if validation found no errors
            let user_to_add = new UserProfile(body.FirstName, body.LastName, body.Description, body.Biography, body.Tags,
                body.PictureReference, body.Matches, creation_date, body.OnlineStatus,
                body.MoveInDate, body.MoveOutDate, body.Birthday, body.EmailAddress,
                body.PhoneNumber, body.Gender, body.IsSearchingRoom, body.IsAdvertisingRoom)


            return repository.addUserProfile(user_to_add.toJson()).then((response) => {
                // As soon as the user object is posted into the database precede with auth user profile creation
                return createUserWithEmailAndPassword(auth, body.EmailAddress, body.Password)
                    .then((userCredential) => {
                        return user_to_add.toJson().toString();
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(errorCode);
                        console.log(errorMessage);

                        repository.deleteUserProfile(user_to_add.emailAddress).then(
                            (response) => {
                                console.log("Response from DB cleanup due to auth user creation failure: " + response);
                            }
                        );
                        throw new FirestoreError(errorMessage);
                    });
            })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode);
                    console.log(errorMessage)
                    throw new AuthError(errorMessage);
                });
        } else {
            // Throw value error with list of errors which were found if validation failed
            throw new ValueError(validation_results.errors.toString());
        }
    }

}
