import {Repository} from "../repository/Repository";
import {getAuth as adminGetAuth} from "firebase-admin/auth";
import {createUserWithEmailAndPassword, deleteUser, getAuth} from "firebase/auth";
import {Validator} from "../validation/Validator";
import * as functions from "firebase-functions";
import {UserProfileConverter} from "../converters/UserProfileConverter";

export class UserProfileDataService {

    static async addUserProfile(body: any): Promise<string> {
        functions.logger.debug("Entered UserProfileDataService", {structuredData: true});

        // Initialize services and vars
        const repository = new Repository();
        const auth = getAuth();

        // Validate user which should be added
        const validation_results = Validator.validatePostUser(body);

        if (!validation_results.validationFoundErrors()) {
            functions.logger.debug("Post Request: Passed validation", {structuredData: true});

            // Precede if validation found no errors
            let user_to_add = UserProfileConverter.convertPostDto(body);

            // As soon as the user object is posted into the database precede with auth user profile creation
            return createUserWithEmailAndPassword(auth, body.email, body.password)
                .then((userCredential) => {
                    user_to_add.profileId = userCredential.user.uid;
                    return repository.addUserProfile(user_to_add)
                        .then((response) => {
                            return user_to_add.toJson();
                        })
                        .catch((e) => {
                            functions.logger.debug(e, {structuredData: true})
                            deleteUser(userCredential.user)
                                .then(() => {
                                        throw new Error("Error: Could not post user due to: " + e.message)
                                    }
                                )
                                .catch(((delete_error) => {
                                    throw new Error("Could not post user object to firestore " +
                                        "but could also not delete already signed up auth user: " + e.message)
                                }));
                        });
                });

        } else {
            // Throw value error with list of errors which were found if validation failed
            throw new Error(validation_results.toJson());
        }
    }

    static async updateUser(body: any): Promise<string> {
        throw new Error("Method not implemented.");
    }


    static async deleteUser(profileId: string): Promise<string> {

        const repository = new Repository();
        return (
        adminGetAuth()
            .deleteUser(profileId)
            .then(() => {
                return repository.deleteUserProfile(profileId)
                    .then((response) => {
                        return response
                    })
                    .catch((error) => {
                        throw new Error('Error: User was deleted from auth but not from firestore: ' + error.message);
                    })
            })
        );
    }

}
