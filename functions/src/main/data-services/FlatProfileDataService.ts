import {FlatRepository} from "../repository/FlatRepository";
import * as functions from "firebase-functions";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {initializeApp} from "firebase/app";
import {config} from "../../../firebase_config";
import {v4 as uuidv4} from "uuid";
import {FlatValidator} from "../validation/FlatValidator";
import {ProfileRepository} from "../repository/ProfileRepository";
import {ReferenceController} from "../ReferenceHandling/ReferenceController";

export class FlatProfileDataService {

    flat_repository: FlatRepository;
    user_repository: ProfileRepository;

    constructor(flat_repo: FlatRepository, user_repo: ProfileRepository) {
        this.flat_repository = flat_repo;
        this.user_repository = user_repo;
        initializeApp(config);
    }

    async addFlatProfile(body: any, uid: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});


        // Validate user which should be added
        let validation_results = FlatValidator.validatePostUser(body);

        if (!validation_results.validationFoundErrors()) {
            functions.logger.debug("Post Request: Passed validation", {structuredData: true});

            // Precede if validation found no errors
            let flat_to_add = FlatProfileConverter.convertPostDto(body);

            flat_to_add.profileId = "flt#" + uuidv4();
            // After profile id is fetched from auth write flat into db
            const repo_response = await this.flat_repository.addProfile(flat_to_add)
                .catch((repo_error) => {
                    functions.logger.debug(repo_error, {structuredData: true})
                    throw new Error("Could not post user due to: " + repo_error.message);
                })
            functions.logger.debug(repo_response, {structuredData: true});

            // Convert references

            const reference_converter = new ReferenceController(this.user_repository);
            await reference_converter.resolveProfileReferenceList(flat_to_add.matches)
                .then((resolution) => {
                    flat_to_add.matches = resolution.result;
                });
            await reference_converter.resolveProfileReferenceList(flat_to_add.roomMates)
                .then((resolution) => {
                    flat_to_add.roomMates = resolution.result;
                });


            return flat_to_add.toJson();


        } else {
            // Throw value error with list of errors which were found if validation failed
            functions.logger.debug(validation_results.toString(), {structuredData: true});
            throw new Error(validation_results.toString());
        }
    }


    async deleteFlat(profileId: string): Promise<string> {

        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});
        return (this.flat_repository.deleteProfile(profileId)
            .then((response) => {
                return response
            })
            .catch((error) => {
                throw new Error('Error: User was deleted from auth but not from firestore: ' + error.message);
            }))
    }

}
