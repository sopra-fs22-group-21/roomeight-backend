import {UserRepository} from "../repository/UserRepository";
import {createUserWithEmailAndPassword, deleteUser, getAuth} from "firebase/auth";
import {UserValidator} from "../validation/UserValidator";
import * as functions from "firebase-functions";
import {UserProfileConverter} from "../converters/UserProfileConverter";
import {initializeApp} from "firebase/app";
import {config} from "../../../firebase_config";
import {ReferenceControler} from "../ReferenceHandling/ReferenceControler";
import * as admin from 'firebase-admin';

export class UserProfileDataService {

    private repository: UserRepository;
    private app: any;

    constructor(repo: UserRepository, app: any) {
        this.repository = repo;
        this.app = app;
        initializeApp(config);
    }

    async addUserProfile(body: any): Promise<string> {
        functions.logger.debug("Entered UserProfileDataService", {structuredData: true});

        const auth = getAuth();

        // Validate user which should be added
        const validation_results = UserValidator.validatePostUser(body);

        if (!validation_results.validationFoundErrors()) {
            functions.logger.debug("Post Request: Passed validation", {structuredData: true});

            // Precede if validation found no errors
            let user_to_add = UserProfileConverter.convertPostDto(body);

            // As soon as the user object is posted into the database precede with auth user profile creation
            const userCredential = await createUserWithEmailAndPassword(auth, user_to_add.email, body.password)
            user_to_add.profileId = userCredential.user.uid;
            // After profile id is fetched from auth write user into db
            const repo_response = await this.repository.addProfile(user_to_add)
                .catch((repo_error) => {
                    functions.logger.debug(repo_error, {structuredData: true})
                    deleteUser(userCredential.user)
                    throw new Error("Could not post user due to: " + repo_error.message);
                })
            functions.logger.debug(repo_response, {structuredData: true});
            let dto = user_to_add.toJson();

            // Convert references to actual profiles
            const reference_converter = new ReferenceControler(this.repository);

            await reference_converter.resolveProfileReferenceList(dto.matches)
                .then((resolution) => {
                    dto.matches = resolution.result;
                });

            // Return UserProfile which has been added
            return dto;

        } else {
            // Throw value error with list of errors which were found if validation failed
            functions.logger.debug(validation_results.toString(), {structuredData: true});
            throw new Error(validation_results.toString());
        }
    }


    async updateUser(update_fields: any, profile_id: string): Promise<string> {
        functions.logger.debug("Entered UserProfileDataService", {structuredData: true});

        // Validate the fields that should be updated
        const validation_results = UserValidator.validatePatchUser(update_fields);

        if (!validation_results.validationFoundErrors()) {
            // If no errors were found in the validation initialize the update in the repo
            return this.repository.updateProfile(update_fields, profile_id);
        } else {
            // Throw value error with list of errors which were found if validation failed
            throw new Error(validation_results.toString());
        }
    }


    async deleteUser(profileId: string): Promise<string> {
        return (
        admin.auth(this.app)
            .deleteUser(profileId)
            .then(() => {
                return this.repository.deleteProfile(profileId)
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
