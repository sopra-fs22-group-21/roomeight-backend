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

    async addFlatProfile(body: any, user_uid: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});

        // Validate flat which should be added
        let validation_results = FlatValidator.validatePostFlat(body);

        if (!validation_results.validationFoundErrors()) {
            functions.logger.debug("Post Request: Passed validation", {structuredData: true});

            // Precede if validation found no errors
            body.user_uid = user_uid;
            let flat_to_add = FlatProfileConverter.convertPostDto(body);

            flat_to_add.profileId = "flt$" + uuidv4();
            // After profile id is fetched from auth write flat into db
            const repo_response = await this.flat_repository.addProfile(flat_to_add)
                .catch((repo_error) => {
                    functions.logger.debug(repo_error, {structuredData: true})
                    throw new Error("Could not post user due to: " + repo_error.message);
                })
            const update_fields = {
                "isSearchingRoom": false,
                "isAdvertisingRoom": true,
                "flatId": flat_to_add.profileId
            }
            await this.user_repository.updateProfile(update_fields, user_uid);
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


    async deleteFlat(profileId: string, user_uid: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});
        return this.flat_repository.getProfileById(profileId)
            .then(
                (flat_toDelete) => {
                    if (!flat_toDelete) {
                        throw new Error('Flat Profile not found')
                    }
                    let roomMates = flat_toDelete.roomMates
                    if (roomMates.includes(user_uid)) {
                        // If uid of token matches the profileId continue with request processing
                        return (this.flat_repository.deleteProfile(profileId)
                            .then((response) => {
                                return response
                            })
                            .catch((error) => {
                                throw new Error('Error: Flat was not deleted from firestore: ' + error.message);
                            }))
                    } else {
                        // Else return NotAuthorized-Exception
                        throw new Error("User is not authorized to delete the selected flat!")
                    }
                }
            )
            .catch(
                (e) => {
                    functions.logger.debug(e, {structuredData: true})
                    throw new Error(e.message);
                    // res.status(404).send(e.message);
                }
            )
    }

    async getProfileByIdFromRepo(profile_id: string): Promise<any> {
        const db_entry = await this.flat_repository.getProfileById(profile_id)
        // Convert references to actual profiles

        if (db_entry) {
            const dto = FlatProfileConverter.convertDBEntryToProfile(db_entry).toJson()

            // Resolve References and clean up outdated References
            const reference_converter = new ReferenceController(this.user_repository);
            await reference_converter.resolveProfileReferenceList(dto.matches)
                .then((resolution) => {
                    reference_converter.cleanUpReferencesList(profile_id, "matches", dto.matches, resolution.unresolvedReferences);
                    dto.matches = resolution.result;
                });
            await reference_converter.resolveProfileReferenceList(dto.roomMates)
                .then((resolution) => {
                    reference_converter.cleanUpReferencesList(profile_id, "roomMates", dto.roomMates, resolution.unresolvedReferences);
                    dto.roomMates = resolution.result;
                });
            return dto;

        } else {
            throw new Error("Flat Profile not found!")
        }
    }

    async getProfilesFromRepo(): Promise<any> {
        const db_entries = await this.flat_repository.getProfiles();

        if (db_entries) {
            let result: any[] = []
            db_entries.map((entry: any) => {
                result.push(FlatProfileConverter.convertDBEntryToProfile(entry).toJson());
            })

            // Resolve References and clean up outdated References
            const reference_converter = new ReferenceController(this.user_repository);
            for (let i in result) {
                await reference_converter.resolveProfileReferenceList(result[i].matches)
                    .then((resolution) => {
                        reference_converter.cleanUpReferencesList(result[i].profileId, "matches", result[i].matches, resolution.unresolvedReferences);
                        result[i].matches = resolution.result;
                    });
                await reference_converter.resolveProfileReferenceList(result[i].roomMates)
                    .then((resolution) => {
                        reference_converter.cleanUpReferencesList(result[i].profileId, "roomMates", result[i].roomMates, resolution.unresolvedReferences);
                        result[i].roomMates = resolution.result;
                    });
            }
            return result;

        } else {
            throw new Error("Flat Profile not found!")
        }
    }

    async updateFlat(body: any, flat_id: string, user_uid: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});
        return this.flat_repository.getProfileById(flat_id)
            .then(
                (flat_toUpdate) => {
                    if (!flat_toUpdate) {
                        throw new Error('Flat Profile not found')
                    }
                    let roomMates = flat_toUpdate.roomMates
                    if (roomMates.includes(user_uid)) {
                        // If uid of token matches the profileId continue with request processing
                        return (this.flat_repository.updateProfile(body, flat_id)
                            .then((response) => {
                                return response
                            })
                            .catch((error) => {
                                throw new Error('Error: something went wrong and Flat was not updated: ' + error.message);
                            }))
                    } else {
                        // Else return NotAuthorized-Exception
                        throw new Error("User is not authorized to delete the selected flat!")
                    }
                }
            )
            .catch(
                (e) => {
                    functions.logger.debug(e, {structuredData: true})
                    throw new Error(e.message);
                    // res.status(404).send(e.message);
                }
            )
    }
}
