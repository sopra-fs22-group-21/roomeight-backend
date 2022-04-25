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

export class UserProfileDataService {

    private user_repository: UserRepository;
    private flat_repository: FlatRepository;
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
            const reference_converter = new ReferenceController(this.user_repository);

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
            return this.user_repository.updateProfile(update_fields, profile_id);
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
                return this.user_repository.deleteProfile(profileId)
                    .then((response) => {
                        return response
                    })
                    .catch((error) => {
                        throw new Error('Error: User was deleted from auth but not from firestore: ' + error.message);
                    })
            })
        );
    }

    async getProfileByIdFromRepo(profile_id: string): Promise<any> {
        const db_entry = await this.user_repository.getProfileById(profile_id)
        // Convert references to actual profiles

        if (db_entry) {
            // Convert references to actual profiles
            let dto = UserProfileConverter.convertDBEntryToProfile(db_entry).toJson();

            // Resolve References and clean up outdated references
            const reference_converter = new ReferenceController(this.user_repository);
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

    async likeUser(profile_id: string, like_id: string): Promise<string> {
        // Get Profile and Like
        const profile_response = await this.user_repository.getProfileById(profile_id)
            .catch((e) => {throw new Error("Profile not found")})
        const profile = UserProfileConverter.convertDBEntryToProfile(profile_response)

        const like_response = await this.user_repository.getProfileById(profile_id)
            .catch((e) => {throw new Error("Liked Profile not found")});
        const like = UserProfileConverter.convertDBEntryToProfile(like_response);

        // Check if user is advertising a room and like is searching a room
        if (profile.isAdvertisingRoom && like.isSearchingRoom) {

        } else {
            throw new Error("You can only like a User if isAdvertisingRoom is false or the user you liked is not searching")
        }

        throw new Error("Not implemented")
    }

    async likeFlat(profile_id: string, like_id: string): Promise<string> {
        // Get Profile and Like

        const profile_response = await this.user_repository.getProfileById(profile_id)
            .catch((e) => {throw new Error("Profile not found")})
        const profile = UserProfileConverter.convertDBEntryToProfile(profile_response)

        const like_response = await this.flat_repository.getProfileById(profile_id)
            .catch((e) => {throw new Error("Liked Profile not found")});

        const like = FlatProfileConverter.convertDBEntryToProfile(like_response);
        let profile_is_liked = false;
            // Check if user is is searching room;
            if (profile.isSearchingRoom) {
                // Check if flat liked the profile
                for (let i in like.matches) {
                    if (like.likes[i].likedUser == profile.profileId) {
                        if (like.likes[i].likes.length >= (like.numberOfRoommates/2)) {
                            profile_is_liked = true;
                        }
                        break;
                    }
                }

                // Update User Likes
                const profile_likes = profile.likes;
                profile_likes.push(like.profileId);

                // Set match if both profiles liked each other else only set own like
                if (profile_is_liked) {
                    // Update Flat
                    const flat_matches = like.matches;
                    flat_matches.push(profile.profileId);
                    const flat_update = {
                        matches: flat_matches
                    }
                    this.flat_repository.updateProfile(flat_update, like.profileId);

                    // Update User
                    const profile_matches = profile.matches;
                    profile_matches.push(like.profileId);
                    const user_update = {
                        matches: profile_matches,
                        likes: profile_likes
                    }
                    await this.user_repository.updateProfile(user_update, profile.profileId);
                } else {
                    // If User is not yet liked by flat -> only set like on user profile
                    const user_update = {
                        likes: profile_likes
                    }
                    await this.user_repository.updateProfile(user_update, profile.profileId);
                }
            } else {
                throw new Error("You cannot like a flat if isSearchingRoom is false")
            }

        throw new Error("Not implemented")
    }
}
