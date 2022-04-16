import {FlatRepository} from "../repository/FlatRepository";
import * as functions from "firebase-functions";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {initializeApp} from "firebase/app";
import {config} from "../../../firebase_config";
import {v4 as uuidv4} from "uuid";
import {FlatValidator} from "../validation/FlatValidator";

export class FlatProfileDataService {

    repository: FlatRepository;

    constructor(repo: FlatRepository) {
        this.repository = repo;
        initializeApp(config);
    }

    async addFlatProfile(body: any, uid: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});


        // Validate user which should be added
        const validation_results = FlatValidator.validatePostUser(body);

        if (!validation_results.validationFoundErrors()) {
            functions.logger.debug("Post Request: Passed validation", {structuredData: true});

            // Precede if validation found no errors
            let flat_to_add = FlatProfileConverter.convertPostDto(body, uid);

            flat_to_add.profileId = "flt#" + uuidv4();
            // After profile id is fetched from auth write flat into db
            const repo_response = await this.repository.addFlatProfile(flat_to_add)
                .catch((repo_error) => {
                    functions.logger.debug(repo_error, {structuredData: true})
                    throw new Error("Could not post user due to: " + repo_error.message);
                })
            functions.logger.debug(repo_response, {structuredData: true});
            return flat_to_add.toJson();


        } else {
            // Throw value error with list of errors which were found if validation failed
            functions.logger.debug(validation_results.toString(), {structuredData: true});
            throw new Error(validation_results.toString());
        }
    }


    async deleteFlat(profileId: string): Promise<string> {
        return (this.repository.deleteFlatProfile(profileId)
            .then((response) => {
                return response
            })
            .catch((error) => {
                throw new Error('Error: User was deleted from auth but not from firestore: ' + error.message);
            }))
    }

}
