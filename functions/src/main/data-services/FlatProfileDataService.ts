import {FlatRepository} from "../repository/FlatRepository";
import * as functions from "firebase-functions";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {initializeApp} from "firebase/app";
import {config} from "../../../firebase_config";
import {v4 as uuidv4} from 'uuid';
import {FlatValidator} from "../validation/FlatValidator";
import {ProfileRepository} from "../repository/ProfileRepository";
import {ReferenceController} from "../ReferenceHandling/ReferenceController";
import {UserProfileConverter} from "../converters/UserProfileConverter";
import { ExpoPushClient } from "../clients/ExpoPushClient";
import { MessageData } from "../../assets/Types";
import { NotificationType } from "../data-model/NotificationType";

export class FlatProfileDataService {

    private readonly flat_repository: FlatRepository;
    private readonly user_repository: ProfileRepository;
    private expoPushClient: ExpoPushClient;

    constructor(flat_repo: FlatRepository, user_repo: ProfileRepository) {
        this.flat_repository = flat_repo;
        this.user_repository = user_repo;
        this.expoPushClient = new ExpoPushClient();
        initializeApp(config);
    }

    async addFlatProfile(body: any, user_uid: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});

        // Validate flat which should be added
        let validation_results = FlatValidator.validatePostFlat(body);
        const req_user = await this.user_repository.getProfileById(user_uid)
            .catch((repo_error) => {
                throw new Error("Could not find user which started the request: " + repo_error.message);
            })
        if (req_user.flatId != "") {
            throw new Error ("User is already part of a flat");
        }

        if (!validation_results.validationFoundErrors()) {
            functions.logger.debug("Post Request: Passed validation", {structuredData: true});

            // Precede if validation found no errors
            body.user_uid = user_uid;
            let flat_to_add = FlatProfileConverter.convertPostDto(body);

            flat_to_add.profileId = "flt$" + uuidv4();
            // After profile id is fetched from auth write flat into db
            const repo_response = await this.flat_repository.addProfile(flat_to_add)
                .catch((repo_error) => {
                    throw new Error("Could not post user due to: " + repo_error.message);
                })
            const update_fields = {
                "isSearchingRoom": false,
                "isAdvertisingRoom": true,
                "flatId": flat_to_add.profileId,
                "matches": [],
                "viewed": [],
                "likes": [],
                "filters": {"matchingTimeRange": true}
            }
            await this.user_repository.updateProfile(update_fields, user_uid);
            functions.logger.debug(repo_response, {structuredData: true});

            // Convert references

            const reference_converter = new ReferenceController(this.user_repository, this.flat_repository);
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
        let flat_toDelete = await this.flat_repository.getProfileById(profileId)
            .catch(
                (e) => {
                    throw new Error(e.message);
                }
            )

            if (!flat_toDelete) {
                throw new Error('Flat Profile not found')
            }
            let roomMates = flat_toDelete.roomMates
            const update_fields = {
                "flatId": "",
                "isAdvertisingRoom": false,
                "isSearchingRoom": true,
                "filters": {"matchingTimeRange": true}
            }
            if (roomMates.includes(user_uid)) {
                // If uid of token matches the profileId continue with request processing
                for (let roomMate of roomMates) {
                    await this.user_repository.updateProfile(update_fields, roomMate);
                }

                // delete matches on matched users
                let matches = flat_toDelete.matches;
                for (let match of matches) {
                    const user_toUpdate = await this.user_repository.getProfileById(match)
                        .catch((e) => {throw new Error("Something went wrong while getting the flat object " + e)});

                    let userMatches = user_toUpdate.matches;
                    const index = userMatches.indexOf(flat_toDelete.profileId, 0);
                    if (index > -1) {
                        userMatches.splice(index, 1);
                    }
                    const updatedMatches = {
                        "matches": userMatches
                    }

                    await this.user_repository.updateProfile(updatedMatches, user_toUpdate.profileId)
                        .catch((error) => {
                            throw new Error('Error: something went wrong and Flat was not updated: ' + error.message);
                        })

                }

                return (this.flat_repository.deleteProfile(profileId)
                    .catch((error) => {
                        throw new Error('Error: Flat was not deleted from firestore: ' + error.message);
                    }))
            } else {
                // Else return NotAuthorized-Exception
                throw new Error("User is not authorized to delete the selected flat!")
            }

    }

    async getProfileByIdFromRepo(profile_id: string): Promise<any> {
        const db_entry = await this.flat_repository.getProfileById(profile_id)
        // Convert references to actual profiles

        if (db_entry) {
            const dto = FlatProfileConverter.convertDBEntryToProfile(db_entry).toJson()

            // Resolve References and clean up outdated References
            const reference_converter = new ReferenceController(this.user_repository, this.flat_repository);
            // Matches
            await reference_converter.resolveProfileReferenceList(dto.matches)
                .then((resolution) => {
                    if (resolution.unresolvedReferences.length > 0) {
                        reference_converter.cleanUpReferencesList(profile_id, "matches", dto.matches, resolution.unresolvedReferences);
                    }
                    dto.matches = resolution.result;
                });
            // Roommates
            await reference_converter.resolveProfileReferenceList(dto.roomMates)
                .then((resolution) => {
                    if (resolution.unresolvedReferences.length > 0) {
                        reference_converter.cleanUpReferencesList(profile_id, "roomMates", dto.roomMates, resolution.unresolvedReferences);
                    }
                    dto.roomMates = resolution.result;
                });
            // Likes
            await reference_converter.resolveFlatLikes(dto.likes)
                .then((resolution) => {
                    dto.likes = resolution.result;
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
            const reference_converter = new ReferenceController(this.user_repository, this.flat_repository);
            for (let i in result) {
                await reference_converter.resolveProfileReferenceList(result[i].matches)
                    .then((resolution) => {
                        if (resolution.unresolvedReferences.length > 0) {
                            reference_converter.cleanUpReferencesList(result[i].profileId, "matches", result[i].matches, resolution.unresolvedReferences);
                        }
                        result[i].matches = resolution.result;
                    });
                await reference_converter.resolveProfileReferenceList(result[i].roomMates)
                    .then((resolution) => {
                        if (resolution.unresolvedReferences.length > 0) {
                            reference_converter.cleanUpReferencesList(result[i].profileId, "roomMates", result[i].roomMates, resolution.unresolvedReferences);
                        }
                        result[i].roomMates = resolution.result;
                    });
                // Likes
                await reference_converter.resolveFlatLikes(result[i].likes)
                    .then((resolution) => {
                        result[i].likes = resolution.result;
                    });
            }
            return result;

        } else {
            throw new Error("Flat Profiles not found!")
        }
    }

    async updateFlat(body: any, flat_id: string, user_uid: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});

        let validation_results = FlatValidator.validatePatchFlat(body);

        if (!validation_results.validationFoundErrors()) {
            functions.logger.debug("Patch Request: Passed validation", {structuredData: true});
            const flat_to_update = await this.flat_repository.getProfileById(flat_id)
                .catch(
                    (e) => {
                        throw new Error(e.message);
                    }
                )
                if (!flat_to_update) {
                    throw new Error('Flat Profile not found')
                }
                let roomMates = flat_to_update.roomMates
                if (roomMates.includes(user_uid)) {
                    if (body.hasOwnProperty("moveInDate")) {
                        body.moveInDate = new Date(body.moveInDate);
                    }
                    if (body.hasOwnProperty("moveOutDate")) {
                        body.moveOutDate = new Date(body.moveOutDate);
                    }
                    // If uid of token matches the profileId continue with request processing
                    await this.flat_repository.updateProfile(body, flat_id)
                        .catch((error) => {
                            throw new Error('Error: something went wrong and Flat was not updated: ' + error.message);
                        })
                    return this.getProfileByIdFromRepo(flat_id)
                        .catch((error) => {
                            throw new Error('Error: Flat was updated but could not get new instance: ' + error.message);
                        })
                } else {
                    // Else return NotAuthorized-Exception
                    throw new Error("User is not authorized to delete the selected flat!")
                }
        }else {
            // Throw value error with list of errors which were found if validation failed
            functions.logger.debug(validation_results.toString(), {structuredData: true});
            throw new Error(validation_results.toString());
        }
    }

    async addUserToFlat(user_uid: string, mate_email: string): Promise<string> {
        functions.logger.debug("Entered FlatProfileDataService", {structuredData: true});
        let user = await this.user_repository.getProfileById(user_uid)
            .catch((e) => {throw new Error(e.message)});
        if (!user) {
            throw new Error(`User Profile with id ${user_uid} not found`)
        }

        const flatId = user.flatId;
        const flat = await this.flat_repository.getProfileById(flatId)
            .catch((e) => {throw new Error("Something went wrong while getting the flat object " + e)});
        if (!flat) {
            throw new Error(`Could not find flat ${flatId} where user should be added`)
        }

        const mate = await this.user_repository.getProfileByEmail(mate_email)
            .catch((e) => {throw new Error("The User you wanted to add to your flat does not exist! " + e)});

        if (!mate) {
            throw new Error(`User Profile (new Mate) with email ${mate_email} not found`)
        }
        if (mate.flatId != "") {
            throw new Error (`User (new Mate) with email ${mate_email} is already part of a flat`);
        }

        // delete the match on all matched flats
        let matches = mate.matches;
        for (let match of matches) {
            const flat_to_update = await this.flat_repository.getProfileById(match)
                .catch((e) => {throw new Error("Something went wrong while getting the flat object " + e)});

            let flatMatches = flat_to_update.matches;
            const index = flatMatches.indexOf(mate.profileId, 0);
            if (index > -1) {
                flatMatches.splice(index, 1);
            }
            const updatedMatches = {
                "matches": flatMatches
            }

            await this.flat_repository.updateProfile(updatedMatches, flat_to_update.profileId)
                .catch((error) => {
                    throw new Error('Error: something went wrong and Flat was not updated: ' + error.message);
                })

        }


        let roomMates = flat.roomMates;
        roomMates.push(mate.profileId)
        const update_flat = {
            "roomMates": roomMates
        }

        await this.flat_repository.updateProfile(update_flat, flatId)
            .catch((error) => {
                throw new Error('Error: something went wrong and Flat was not updated: ' + error.message);
            })

        const update_roomMate = {
            "flatId": flatId,
            "isSearchingRoom": false,
            "isAdvertisingRoom": true,
            "matches": [],
            "viewed": [],
            "likes": [],
            "filters": {"matchingTimeRange": true}
        }

        return this.user_repository.updateProfile(update_roomMate, mate.profileId)
            .then(() => {
                this.sendNotificationOnJoinFlat(user_uid, mate.profileId, mate.firstName, flat.roomMates, flat.name);
                return `Successfully added user with mail ${mate_email} to flat ${flat.name}`
            })
            .catch((error) => {
                throw new Error('Error: something went wrong and the roomMate was not updated: ' + error.message);
            })
    }

    async deleteUserFromFlat(user_uid: string): Promise<string> {
        // get the user object
        let user = await this.user_repository.getProfileById(user_uid)
            .catch((e) => {throw new Error(e.message)});
        if (!user) {
            throw new Error(`User Profile with id ${user_uid} not found`)
        }

        // get the associated flat
        const flatId = user.flatId;
        const flat = await this.flat_repository.getProfileById(flatId)
            .catch((e) => {throw new Error("Something went wrong while getting the flat object " + e)});
        if (!flat) {
            throw new Error(`Could not find flat ${flatId} where user should be removed`)
        }

        // delete user from roomMates array
        let roomMates = flat.roomMates
        const index = roomMates.indexOf(user_uid, 0);
        if (index > -1) {
            roomMates.splice(index, 1);
        }
        let updatedRoomMates = {
            "roomMates": roomMates
        }
        await this.flat_repository.updateProfile(updatedRoomMates, flatId)
            .catch((error) => {
                throw new Error('Error: something went wrong and Flat was not updated: ' + error.message);
            })

        // update the user
        let update_fields = {
            "flatId": "",
            "viewed": [],
            "isAdvertisingRoom": false,
            "isSearchingRoom": true,
            "filters": {"matchingTimeRange": true}
        }
        return this.user_repository.updateProfile(update_fields, user_uid)
            .then(() => {
                this.sendNotificationOnLeaveFlat(roomMates, user.firstName)
                return `Successfully removed user with ${user_uid} from flat ${flat.name}`
            })
            .catch((error) => {
                throw new Error('Error: something went wrong and the roomMate was not updated: ' + error.message);
            })
    }

    private async getPushTokens(users: string[]):Promise<string[]> {
        let roommate;
        let recipients: string[] = [];
        for (let roommate_id of users) {
            const response = await this.user_repository.getProfileById(roommate_id);
            roommate = UserProfileConverter.convertDBEntryToProfile(response);
            recipients.push(...roommate.devicePushTokens);
        }
        return recipients;
    }

    private async sendNotificationOnLeaveFlat(users: string[], senderName: string): Promise<void> {
        const recipients = await this.getPushTokens(users);
        // Prepare Message
        let mates_message: MessageData = {
            title: 'Roomeight',
            body: `Hey, ${senderName} left your flat!`,
            data: {
                type: NotificationType.ROOMMATE_LEFT_FLAT,
            }
        }
        // Send message
        await this.expoPushClient.pushToClients(recipients, mates_message);
    }
    
    private async sendNotificationOnJoinFlat(senderId:string, newMateId:string, newMateName:string, roomMates:string[], flatName:string): Promise<void> {
        const index = roomMates.indexOf(senderId);
        const oldRoomMates = roomMates.splice(index, 1)
        const oldRoomMatesPushTokens = await this.getPushTokens(oldRoomMates);
        const newMatePushToken = await this.getPushTokens([newMateId]);
        // Prepare Message
        let new_mate_message: MessageData = {
            title: 'Roomeight',
            body: `Hey, you have been added to ${flatName}!`,
            data: {
                type: NotificationType.ROOMMATE_JOINED_FLAT,
            }
        }
        // Send message
        let old_mates_message: MessageData = {
            title: 'Roomeight',
            body: `Hey, ${newMateName} has been added to your flat!`,
            data: {
                type: NotificationType.ROOMMATE_JOINED_FLAT,
            }
        }
        await this.expoPushClient.pushToClients(newMatePushToken, new_mate_message);
        await this.expoPushClient.pushToClients(oldRoomMatesPushTokens, old_mates_message);
    }

    async discover(uid: string, quantity: number): Promise<any> {
        const searchingUser = await this.user_repository.getProfileById(uid)
            .catch((e) => {
                throw new Error("Could not fetch own Userprofile due to: " + e.message)
            })
        if (!searchingUser) {
            throw new Error(`User Profile with id ${uid} not found`)
        }
        const ownFlat = await this.flat_repository.getProfileById(searchingUser.flatId)
            .catch((e) => {
            throw new Error("Could not fetch own Flatprofile due to: " + e.message)
        })
        if (!ownFlat) {
            throw new Error(`Flat Profile with id ${searchingUser.flatId} not found`)
        }
        const db_entries: any[] = await this.query(searchingUser, ownFlat);

        if (db_entries) {
            let results: any[] = [];
            let i = 0;
            for (let entry of db_entries) {
                if (!searchingUser.viewed.includes(entry.profileId) && !ownFlat.matches.includes(entry.profileId) && i < quantity) {
                    results.push(entry);
                    i++;
                }
            }

            let resolved: any[] = [];
            results.forEach((entry: any) => {
                resolved.push(UserProfileConverter.convertDBEntryToProfile(entry).toJson());
            })

            functions.logger.debug("user was converted", {structuredData: true});
            // Resolve References and clean up outdated References
            const reference_converter = new ReferenceController(this.flat_repository, this.user_repository);
            for (let index in resolved) {
                await reference_converter.resolveProfileReferenceList(resolved[index].matches)
                    .then((resolution) => {
                        reference_converter.cleanUpReferencesList(resolved[index].profileId, "matches", resolved[index].matches, resolution.unresolvedReferences);
                        resolved[index].matches = resolution.result;
                    });
            }
            return resolved;

        } else {
            throw new Error("No Flat Profiles found!")
        }
    }

    private async query(searchingUser: any, ownFlat: any): Promise<any[]> {
        const filters = searchingUser.filters;
        const users = await this.user_repository.getProfiles();
        let matches: any[] = [];
        for (let user of users) {
            let filterMatch = [];
            filterMatch.push(user.isSearchingRoom);
            if (filters.hasOwnProperty("tags")) {
                for(let tag of filters.tags) {
                    filterMatch.push(user.tags.includes(tag))
                }
            }
            if (filters.hasOwnProperty("gender")) {
                filterMatch.push(user.gender == filters.gender)
            }
            if (filters.hasOwnProperty("permanent")) {
                if (filters.permanent == true) {
                    filterMatch.push(user.moveOutDate == null);
                } else if (filters.permanent == false) {
                    filterMatch.push(user.moveOutDate != null);
                }
            }
            if (filters.hasOwnProperty("age")) {
                if (filters.age.hasOwnProperty("max")) {
                    let maxDate = new Date();
                    maxDate.setFullYear( maxDate.getFullYear() - (filters.age.max + 1));
                    filterMatch.push(user.birthday.toDate() >= maxDate);
                }
                if (filters.age.hasOwnProperty("min")) {
                    let minDate = new Date();
                    minDate.setFullYear( minDate.getFullYear() - filters.age.min );
                    filterMatch.push(user.birthday.toDate() <= minDate);
                }
            }
            if (filters.matchingTimeRange) {
                if (ownFlat.moveInDate) {
                    if (user.moveOutDate) {
                        filterMatch.push(ownFlat.moveInDate.toDate() <= user.moveOutDate.toDate())
                    }
                }
                if (ownFlat.moveOutDate) {
                    if (user.moveInDate) {
                        filterMatch.push(ownFlat.moveOutDate.toDate() >= user.moveInDate.toDate())
                    }
                }
            }

            if(!filterMatch.includes(false)) {
                matches.push(user);
            }
        }

        return matches
    }
}
