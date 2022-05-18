import {UserRepository} from "../repository/UserRepository";
import {createUserWithEmailAndPassword, deleteUser, getAuth} from "firebase/auth";
import {UserValidator} from "../validation/UserValidator";
import * as functions from "firebase-functions";
import {initializeApp} from "firebase/app";
import {config} from "../../../firebase_config";
import {ReferenceController} from "../ReferenceHandling/ReferenceController";
import * as admin from 'firebase-admin';
import {UserProfileConverter} from "../converters/UserProfileConverter";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {FlatRepository} from "../repository/FlatRepository";
import {Like} from "../data-model/Like";
import {ExpoPushClient} from "../clients/ExpoPushClient";
import {MessageData} from "../../assets/Types";
import {NotificationType} from "../data-model/NotificationType";
import {FlatProfile} from "../data-model/FlatProfile";
import {UserProfile} from "../data-model/UserProfile";

export class UserProfileDataService {

    private readonly user_repository: UserRepository;
    private readonly flat_repository: FlatRepository;
    // Number of likes needed in a flat that a user becomes a match
    private readonly flat_match_ratio: number;
    private expoPushClient: ExpoPushClient;
    private app: any;

    constructor(user_repo: UserRepository, flat_repo: FlatRepository, app: any) {
        this.user_repository = user_repo;
        this.flat_repository = flat_repo;
        this.app = app;
        this.expoPushClient = new ExpoPushClient();

        initializeApp(config);
        this.flat_match_ratio = 0.5;
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
            const repo_response = await this.user_repository.addProfile(user_to_add)
                .catch((repo_error) => {
                    functions.logger.debug(repo_error, {structuredData: true})
                    deleteUser(userCredential.user)
                    throw new Error("Could not post user due to: " + repo_error.message);
                })
            functions.logger.debug(repo_response, {structuredData: true});
            let dto = user_to_add.toJson();

            // Convert references to actual profiles
            const reference_converter = new ReferenceController(this.flat_repository, this.user_repository);

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
            if (update_fields.hasOwnProperty("moveInDate")) {
                update_fields.moveInDate = new Date(update_fields.moveInDate);
            }
            if (update_fields.hasOwnProperty("moveOutDate")) {
                update_fields.moveOutDate = new Date(update_fields.moveOutDate);
            }
            if (update_fields.hasOwnProperty("birthday")) {
                update_fields.birthday = new Date(update_fields.birthday);
            }
            functions.logger.info(update_fields);
            await this.user_repository.updateProfile(update_fields, profile_id)
                .catch((error) => {
                        throw new Error('Error: something went wrong and User was not updated: ' + error.message);
                    })
            return this.getProfileByIdFromRepo(profile_id)
                .catch((error) => {
                    throw new Error('Error: User was updated but could not get new instance: ' + error.message);
                })
        } else {
            // Throw value error with list of errors which were found if validation failed
            throw new Error(validation_results.toString());
        }
    }


    async deleteUser(profileId: string): Promise<string> {

        // delete the match on all matched flats
        let user = await this.user_repository.getProfileById(profileId)
            .catch(
                (e) => {
                    functions.logger.debug(e, {structuredData: true})
                    throw new Error(e.message);
                }
            )
        // Check if user exists on repo
        if (!user) {
            throw new Error("User Profile not found!")
        }

        // Delete matches with the user that should be deleted
        let matches = user.matches;
        for (let match of matches) {
            const flat_toUpdate = await this.flat_repository.getProfileById(match)
                .catch((e) => {throw new Error("Something went wrong while getting the flat object " + e)});

            let flatMatches = flat_toUpdate.matches;
            const index = flatMatches.indexOf(user.profileId, 0);
            if (index > -1) {
                flatMatches.splice(index, 1);
            }
            const updatedMatches = {
                "matches": flatMatches
            }

            await this.flat_repository.updateProfile(updatedMatches, flat_toUpdate.profileId)
                .catch((error) => {
                    throw new Error('Error: something went wrong and Flat was not updated: ' + error.message);
                })

        }
        // Delete User from auth and from firestore
        await admin.auth(this.app).deleteUser(profileId)
        return this.user_repository.deleteProfile(profileId)
            .then((response) => {
                return response
            })
            .catch((error) => {
                throw new Error('Error: User was deleted from auth but not from firestore: ' + error.message);
            })

    }

    async getProfileByIdFromRepo(profile_id: string): Promise<any> {
        const db_entry = await this.user_repository.getProfileById(profile_id)
        // Convert references to actual profiles

        if (db_entry) {
            // Convert references to actual profiles
            let dto = UserProfileConverter.convertDBEntryToProfile(db_entry).toJson();

            // Resolve References and clean up outdated references
            const reference_converter = new ReferenceController(this.flat_repository, this.user_repository);
            await reference_converter.resolveProfileReferenceList(dto.matches)
                .then((resolution) => {
                    reference_converter.cleanUpReferencesList(profile_id, "matches", dto.matches, resolution.unresolvedReferences);
                    dto.matches = resolution.result;
                });
            return dto;

        } else {
            throw new Error("User Profile not found!")
        }
    }

    async getProfilesFromRepo(): Promise<any> {
        const db_entries = await this.user_repository.getProfiles();

        if (db_entries) {
            let result: any[] = []
            db_entries.map((entry: any) => {
                result.push(UserProfileConverter.convertDBEntryToProfile(entry).toJson());
            })

            // Resolve References and clean up outdated References
            const reference_converter = new ReferenceController(this.flat_repository, this.user_repository);
            for (let i in result) {
                await reference_converter.resolveProfileReferenceList(result[i].matches)
                    .then((resolution) => {
                        reference_converter.cleanUpReferencesList(result[i].profileId, "matches", result[i].matches, resolution.unresolvedReferences);
                        result[i].matches = resolution.result;
                    });
            }
            return result;

        } else {
            throw new Error("User Profiles not found!")
        }
    }

    async likeUser(user_id: string, like_id: string): Promise<any> {

        // Get Profile and Like
        const user_response = await this.user_repository.getProfileById(user_id)
            .catch(() => {throw new Error("Profile not found")})
        const user = UserProfileConverter.convertDBEntryToProfile(user_response)

        // Preconditions
        if(user.flatId == "") {
            throw new Error("Flat id of liking user is not set. You can only like a user if you belong to a flat")
        }
        if (!user.isAdvertisingRoom) {
            throw new Error("You can only like a User if isAdvertisingRoom is true")
        }

        const user_flat_response = await this.flat_repository.getProfileById(user.flatId)
            .catch(() => {throw new Error("The flat of the liking user could not be found. You can only like a user if you belong to a flat")});
        const user_flat = FlatProfileConverter.convertDBEntryToProfile(user_flat_response);

        const like_response = await this.user_repository.getProfileById(like_id)
            .catch(() => {throw new Error("Liked Profile not found")});
        const liked_user = UserProfileConverter.convertDBEntryToProfile(like_response);

        // Precondition
        if (!liked_user.isSearchingRoom) {
            throw new Error("You can only like a User which has set flag isSearchingRoom")
        }

        // Defining Vars
        let is_liked = false;
        let is_match = false;
        let new_flat_likes = user_flat.likes.map((like) =>like.toJson());
        let new_flat_matches = user_flat.matches;

        // Check if like of user already exists on flat
        for (let i in user_flat.likes) {
            if (user_flat.likes[i].likedUser == liked_user.profileId) {
                is_liked = true;
                // Check if at min half of the roommates liked the user -> if yes: match
                let number_of_likes = user_flat.likes[i].likes.length + 1;
                this.checkIsFlatMatch(number_of_likes, liked_user, user_flat);

                is_match = this.checkIsFlatMatch(number_of_likes, liked_user, user_flat);

                // Push user id to likes
                new_flat_likes[i].likes.push(user.profileId);
                break;
            }
        }

        // Create new like object and add it if none exists
        if (!is_liked) {
            new_flat_likes.push(new Like([user.profileId], liked_user.profileId).toJson());
            is_match = this.checkIsFlatMatch(1, liked_user, user_flat);
        }

        await this.userLikeProfilesUpdate(new_flat_likes, new_flat_matches, user, liked_user, is_match, user_flat);

        // Resolve references of updated Profile
        let reference_converter = new ReferenceController(this.user_repository, this.flat_repository);
        let updated_flat_profile = user_flat.toJson();

        await reference_converter.resolveProfileReferenceList(new_flat_matches)
            .then((resolution) => {
                updated_flat_profile.matches = resolution.result;
            });

        // Send Notifications if user also liked flat (also if it is not a match due to too few likes from roommates)
        const flat_recipients = await this.getRoommatesPushTokens(user_flat, user);
        if (is_match) {
            await this.sendMatchNotifications(liked_user.devicePushTokens, flat_recipients, user_flat.name, liked_user.first_name);
        } else if(liked_user.likes.includes(user_flat.profileId)) {
            await this.sendLikeNotifications(flat_recipients, user, liked_user);
        }

        return {
            isMatch: is_match,
            updatedFlatProfile: updated_flat_profile
        }
    }

    private async userLikeProfilesUpdate(new_flat_likes: any[], new_flat_matches: string[], user: UserProfile,
                                 liked_user: UserProfile, is_match: boolean, user_flat: FlatProfile) {
        // updates
        let flat_update = {
            likes: new_flat_likes,
            matches: new_flat_matches
        }

        const new_viewes = user.viewed
        new_viewes.push(liked_user.profileId);
        const user_update = {
            viewed: new_viewes
        }

        // Update user profile (matches) if it is a match
        if (is_match) {
            // Update liked user matches
            let new_liked_user_matches = liked_user.matches;
            new_liked_user_matches.push(user_flat.profileId);
            new_flat_matches.push(liked_user.profileId);
            const liked_user_update = {
                matches: new_liked_user_matches
            }
            await this.user_repository.updateProfile(liked_user_update, liked_user.profileId);
        }

        await this.user_repository.updateProfile(user_update, user.profileId);
        await this.flat_repository.updateProfile(flat_update, user_flat.profileId);
    }

    private checkIsFlatMatch(number_of_likes: number, liked_user: UserProfile, flat: FlatProfile): boolean {
        let nr_of_roommates = flat.roomMates.length;
        if (number_of_likes >= (nr_of_roommates*this.flat_match_ratio)) {
            if (liked_user.likes.indexOf(flat.profileId) > -1 && flat.matches.indexOf(liked_user.profileId) == -1 ) {
                return true;
            }
        }
        return false;
    }

    private async getRoommatesPushTokens(user_flat: FlatProfile, user: UserProfile) {
        let roommate;
        let recipients: string[] = [];
        for (let roommate_id of user_flat.roomMates) {
            if (roommate_id !== user.profileId) {
                const response = await this.user_repository.getProfileById(roommate_id);
                roommate = UserProfileConverter.convertDBEntryToProfile(response);
                recipients.push(...roommate.devicePushTokens)
            }
        }
        return recipients;
    }

    private async sendLikeNotifications(recipients: string[], liking_user: UserProfile, liked_user: UserProfile): Promise<void> {
        // Prepare Message and if isMatch add liked user to recipients list
        let message: MessageData = {
            title: 'Roomeight',
            body: `Hey! Your roomeight ${liking_user.first_name} liked ${liked_user.first_name}`,
            data: {
                type: NotificationType.NEW_LIKE
            }
        }
        // Send message
        await this.expoPushClient.pushToClients(recipients, message);
    }

    private async sendMatchNotifications(user_recipients: string[], flat_recipients: string[], flat_name: string, user_name: string): Promise<void> {
        // Prepare Message and if isMatch add liked user to recipients list
        let user_message: MessageData = {
            title: 'Roomeight',
            body: `It's a match! You matched with the flat ${flat_name}`,
            data: {
                type: NotificationType.NEW_MATCH
            }
        }
        let flat_message: MessageData = {
            title: 'Roomeight',
            body: `It's a match! Your flat matched with ${user_name}`,
            data: {
                type: NotificationType.NEW_MATCH
            }
        }
        // Send messages
        await this.expoPushClient.pushToClients(user_recipients, user_message);
        await this.expoPushClient.pushToClients(flat_recipients, flat_message);
    }

    async likeFlat(profile_id: string, like_id: string): Promise<any> {

        // Get Profile and Like
        const user_response = await this.user_repository.getProfileById(profile_id)
            .catch(() => {throw new Error("Profile not found")})
        const user = UserProfileConverter.convertDBEntryToProfile(user_response)

        const like_response = await this.flat_repository.getProfileById(like_id)
            .catch(() => {throw new Error("Liked Profile not found")});
        const like = FlatProfileConverter.convertDBEntryToProfile(like_response);


        // Precondition
        if (user.likes.indexOf(like.profileId) > -1) {
            throw new Error("Flat already liked");
        }

        let is_match = false;
        let nr_of_roommates = like.roomMates.length;

        // Check if user is searching room
        if (user.isSearchingRoom) {
            // Check if flat liked the profile
            for (let i in like.likes) {
                if (like.likes[i].likedUser == user.profileId) {
                    if (like.likes[i].likes.length >= (nr_of_roommates/2)) {
                        is_match = true;
                    }
                    break;
                }
            }

            // Update User Likes
            const profile_likes = user.likes;
            profile_likes.push(like.profileId);
            const profile_viewed = user.viewed;
            profile_viewed.push(like.profileId);
            let user_update;

            // Set match if both profiles liked each other else only set own like
            const profile_matches = user.matches;

            if (is_match) {
                // Update Flat
                const flat_matches = like.matches;
                flat_matches.push(user.profileId);
                const flat_update = {
                    matches: flat_matches
                }
                await this.flat_repository.updateProfile(flat_update, like.profileId);

                // Prepare user update
                profile_matches.push(like.profileId);
                user_update = {
                    matches: profile_matches,
                    likes: profile_likes,
                    viewed: profile_viewed
                }
                // Send Notifications on match
                const flat_recipients = await this.getRoommatesPushTokens(like, user);
                await this.sendMatchNotifications(user.devicePushTokens, flat_recipients, like.name, user.first_name);

            } else {
                // If User is not yet liked by flat -> only set like on user profile
                user_update = {
                    likes: profile_likes,
                    viewed: profile_viewed
                }
            }
            // Update user
            await this.user_repository.updateProfile(user_update, user.profileId);
            // Resolve references of updated Profile
            let reference_converter = new ReferenceController(this.flat_repository, this.user_repository);
            let updated_user_profile = user.toJson();

            await reference_converter.resolveProfileReferenceList(profile_matches)
                .then((resolution) => {
                    updated_user_profile.matches = resolution.result;
                });

            // Return if a match occurred and the profile containing the new match list
            return {
                isMatch: is_match,
                updatedUserProfile: updated_user_profile
            }

        } else {
            throw new Error("You cannot like a flat if your flag isSearchingRoom is false")
        }
    }

    async dislike(uid: string, disliked_id: string): Promise<any> {
        // get user
        const user = await this.user_repository.getProfileById(uid)
            .catch(() => {throw new Error("Profile not found")});

        // update viewed array
        const viewed = user.viewed;
        viewed.push(disliked_id);
         const user_update = {
             "viewed": viewed
         }
        // update user
        return this.user_repository.updateProfile(user_update, user.profileId);
    }

    async addDevice(uid: string, pushToken: string): Promise<string> {
        // get user
        const repo_response = await this.user_repository.getProfileById(uid)
            .catch(() => {throw new Error("Profile not found")});
        const userprofile = UserProfileConverter.convertDBEntryToProfile(repo_response);

        // Check if pushToken is already stored
        if (userprofile.devicePushTokens.indexOf(pushToken) == -1) {
            // Update Token Array
            const updated_token_array = userprofile.devicePushTokens;
            updated_token_array.push(pushToken);

            // Update Userprofile
            const update = {
                "devicePushTokens":  updated_token_array
            }
            await this.user_repository.updateProfile(update, uid)
                .catch((e) => {throw new Error("Could not update devicePushTokens due to: " + e.message)})

            return "Successfully added token to device push token list!"

        } else {
            return "Token exists in current push token list"
        }
    }

    async deleteDevice(uid: string, pushToken: string): Promise<string> {
        // get user
        const repo_response = await this.user_repository.getProfileById(uid)
            .catch(() => {throw new Error("Profile not found")});
        const userprofile = UserProfileConverter.convertDBEntryToProfile(repo_response);
        const pushTokenIndex = userprofile.devicePushTokens.indexOf(pushToken);

        // Check if pushToken is already stored
        if (pushTokenIndex == -1) {
            throw new Error("Could not found token " + pushToken + " in push token list");
        } else {
            // Update Token Array
            const updated_token_array = userprofile.devicePushTokens;
            updated_token_array.splice(pushTokenIndex, 1);

            // Update Userprofile
            const update = {
                "devicePushTokens":  updated_token_array
            }
            await this.user_repository.updateProfile(update, uid)
                .catch((e) => {throw new Error("Could not update devicePushTokens due to: " + e.message)})
            return "Successfully deleted token from push token list"
        }
    }

    async discover(uid: string, quantity: number): Promise<any> {
        const searchingUser = await this.user_repository.getProfileById(uid)
            .catch((e) => {
                throw new Error("Could not fetch own Userprofile due to: " + e.message)
            })
        const db_entries = await this.query(searchingUser)

        if (db_entries) {
            let results: any[] = [];
            let i = 0;
            for (let entry of db_entries) {
                if (!searchingUser.viewed.includes(entry.profileId) && i < quantity) {
                    results.push(entry);
                    i++;
                }
            }

            let resolved: any[] = [];
            results.forEach((entry: any) => {
                resolved.push(FlatProfileConverter.convertDBEntryToProfile(entry).toJson());
            })

            // Resolve References and clean up outdated References
            const reference_converter = new ReferenceController(this.user_repository, this.flat_repository);
            for (let index in resolved) {
                await reference_converter.resolveProfileReferenceList(resolved[index].matches)
                    .then((resolution) => {
                        reference_converter.cleanUpReferencesList(resolved[index].profileId, "matches", resolved[index].matches, resolution.unresolvedReferences);
                        resolved[index].matches = resolution.result;
                    });
                await reference_converter.resolveProfileReferenceList(resolved[index].roomMates)
                    .then((resolution) => {
                        reference_converter.cleanUpReferencesList(resolved[index].profileId, "roomMates", resolved[index].roomMates, resolution.unresolvedReferences);
                        resolved[index].roomMates = resolution.result;
                    });
                // Likes
                await reference_converter.resolveFlatLikes(resolved[index].likes)
                    .then((resolution) => {
                        resolved[index].likes = resolution.result;
                    });
            }
            return resolved;

        } else {
            throw new Error("No Flat Profiles found!")
        }
    }

    private async query(searchingUser: any): Promise<any[]> {
        const filters = searchingUser.filters
        const flats = await this.flat_repository.getProfiles();
        let matches: any[] = [];
        for (let flat of flats) {
            let filterMatch = [];
            if (filters.hasOwnProperty("permanent")) {
                filterMatch.push(flat.permanent == filters.permanent);
            }
            if (filters.hasOwnProperty("tags")) {
                for(let tag of filters.tags) {
                    filterMatch.push(flat.tags.includes(tag))
                }
            }
            if (filters.hasOwnProperty("rent")) {
                if (filters.rent.hasOwnProperty("max")) {
                    filterMatch.push(flat.rent <= filters.rent.max);
                }
                if (filters.rent.hasOwnProperty("min")) {
                    filterMatch.push(flat.rent >= filters.rent.min);
                }
            }
            if (filters.hasOwnProperty("numberOfRoommates")) {
                if (filters.numberOfRoommates.hasOwnProperty("max")) {
                    filterMatch.push(flat.numberOfRoommates <= filters.numberOfRoommates.max);
                }
                if (filters.numberOfRoommates.hasOwnProperty("min")) {
                    filterMatch.push(flat.numberOfRoommates >= filters.numberOfRoommates.min);
                }
            }
            if (filters.hasOwnProperty("numberOfBaths")) {
                if (filters.numberOfBaths.hasOwnProperty("max")) {
                    filterMatch.push(flat.numberOfBaths <= filters.numberOfBaths.max);
                }
                if (filters.numberOfBaths.hasOwnProperty("min")) {
                    filterMatch.push(flat.numberOfBaths >= filters.numberOfBaths.min);
                }
            }
            if (filters.hasOwnProperty("roomSize")) {
                if (filters.roomSize.hasOwnProperty("max")) {
                    filterMatch.push(flat.roomSize <= filters.roomSize.max);
                }
                if (filters.roomSize.hasOwnProperty("min")) {
                    filterMatch.push(flat.roomSize >= filters.roomSize.min);
                }
            }
            if (filters.matchingTimeRange) {
                if (filters.hasOwnProperty("moveInDate")) {
                    if (flat.moveOutDate) {
                        filterMatch.push(new Date(filters.moveInDate) <= flat.moveOutDate.toDate())
                    }
                }
                if (filters.hasOwnProperty("moveOutDate")) {
                    if (flat.moveInDate) {
                        filterMatch.push(new Date(filters.moveOutDate) >= flat.moveInDate.toDate())
                    }
                }
            }

            if(!filterMatch.includes(false)) {
                matches.push(flat);
            }
        }

        return matches
    }
}
