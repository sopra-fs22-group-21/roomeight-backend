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

export class UserProfileDataService {

    private readonly user_repository: UserRepository;
    private readonly flat_repository: FlatRepository;
    private app: any;

    constructor(user_repo: UserRepository, flat_repo: FlatRepository, app: any) {
        this.user_repository = user_repo;
        this.flat_repository = flat_repo;
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

        // Check if flat id is set
        if(user.flatId == "") {
            throw new Error("Flat id of liking user is not set. You can only like a user if you belong to a flat")
        }

        const user_flat_response = await this.flat_repository.getProfileById(user.flatId)
            .catch(() => {throw new Error("The flat of the liking user could not be found. You can only like a user if you belong to a flat")});
        const user_flat = FlatProfileConverter.convertDBEntryToProfile(user_flat_response);

        const like_response = await this.user_repository.getProfileById(like_id)
            .catch(() => {throw new Error("Liked Profile not found")});
        const liked_user = UserProfileConverter.convertDBEntryToProfile(like_response);

        // Preconditions
        if (!user.isAdvertisingRoom) {
            throw new Error("You can only like a User if isAdvertisingRoom is true")
        }
        if (!liked_user.isSearchingRoom) {
            throw new Error("You can only like a User which has set flag isSearchingRoom")
        }

        // Defining Vars
        let is_liked = false;
        let is_match = false;
        let new_flat_likes = user_flat.likes.map((like) =>like.toJson());
        let new_flat_matches = user_flat.matches;
        let nr_of_roommates = user_flat.roomMates.length;

        // Check if like of user already exists on flat
        for (let i in user_flat.likes) {
            if (user_flat.likes[i].likedUser == liked_user.profileId) {
                is_liked = true;
                // Check if at min half of the roommates liked the user -> if yes: match
                if ((user_flat.likes[i].likes.length + 1) >= (nr_of_roommates/2)) {
                    is_match = true;
                }
                // Push user id to likes
                new_flat_likes[i].likes.push(user.profileId);
                break;
            }
        }

        // Create new like object and add it if none exists
        if (!is_liked) {
            new_flat_likes.push(new Like([user.profileId], liked_user.profileId).toJson());
            if (nr_of_roommates <= 2) {
                is_match = true;
            }
        }

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

        if (liked_user.likes.indexOf(user_flat.profileId) > -1 && user_flat.matches.indexOf(liked_user.profileId) == -1 ) {
            // If liked user already liked flat and more than half of your flat liked the user and match does not already exist-> set match
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
        } else {
            is_match = false;
        }

        await this.user_repository.updateProfile(user_update, user.profileId);
        await this.flat_repository.updateProfile(flat_update, user_flat.profileId);

        // Resolve references of updated Profile
        let reference_converter = new ReferenceController(this.user_repository, this.flat_repository);
        let updated_flat_profile = user_flat.toJson();

        await reference_converter.resolveProfileReferenceList(new_flat_matches)
            .then((resolution) => {
                updated_flat_profile.matches = resolution.result;
            });

        return {
            isMatch: is_match,
            updatedFlatProfile: updated_flat_profile
        }
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

        // Check if user is searching room;
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
}
