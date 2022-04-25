import {ProfileRepository} from "../repository/ProfileRepository";
import {UserProfileConverter} from "../converters/UserProfileConverter";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {ReferenceController} from "../ReferenceHandling/ReferenceController";

export class ProfileDataService {

    userRepo;
    flatRepo;

    constructor(user_repo: ProfileRepository, flat_repo: ProfileRepository) {
        this.userRepo = user_repo;
        this.flatRepo = flat_repo;
    }

    async getProfileByIdFromRepo(profile_id: string): Promise<any> {
        let repo;
        if(profile_id.split("#")[0] == "flt") {
            repo = this.flatRepo;
        } else {
            repo = this.userRepo;
        }
        const db_entry = await repo.getProfileById(profile_id)
        // Convert references to actual profiles
        let dto: any;

        if (db_entry) {
            if(profile_id.split("#")[0] == "flt") {
                dto = FlatProfileConverter.convertDBEntryToProfile(db_entry).toJson()

                const reference_converter = new ReferenceController(this.userRepo);
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

            } else {
                dto = UserProfileConverter.convertDBEntryToProfile(db_entry).toJson()

                // Convert references to actual profiles
                const reference_converter = new ReferenceController(this.userRepo);
                await reference_converter.resolveProfileReferenceList(dto.matches)
                    .then((resolution) => {
                        reference_converter.cleanUpReferencesList(profile_id, "matches", dto.matches, resolution.unresolvedReferences);
                        dto.matches = resolution.result;
                    });
            }
            return dto;

        } else {
            throw new Error("Profile not found!")
        }
    }

    async likeProfile(profile_id: string, like_id: string): Promise<string> {
        // Define repo and converter for like
        let like_repo: ProfileRepository;
        let like_is_flat;
        if (profile_id.split("#")[0] != "flt" && like_id.split("#")[0] == "flt") {
            like_repo = this.flatRepo;
            like_is_flat = true;
        } else if (profile_id.split("#")[0] != "flt" && like_id.split("#")[0] != "flt") {
            like_repo = this.userRepo;
            like_is_flat = false;
        } else {
            throw new TypeError("Only User likes User and User likes Flat possible")
        }

        // Get Profile and Like

        const profile_response = await this.userRepo.getProfileById(profile_id)
            .catch((e) => {throw new Error("Profile not found")})
        const profile = UserProfileConverter.convertDBEntryToProfile(profile_response)

        const like_response = await like_repo.getProfileById(profile_id)
            .catch((e) => {throw new Error("Liked Profile not found")});

        let like: any;
        let profile_is_liked = false;

        if (like_is_flat) {
            like = FlatProfileConverter.convertDBEntryToProfile(like_response);
            // Check if user is is searching room;
            if (profile.isSearchingRoom) {
                // Check if flat liked the profile
                for (let i in like.matches) {
                    if (like.matches[i].likedUser == profile.profileId) {
                        if (like.matches[i].likes.length >= (like.numberOfRoommates/2)) {
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
                    this.flatRepo.updateProfile(flat_update, like.profileId);

                    // Update User
                    const profile_matches = profile.matches;
                    profile_matches.push(like.profileId);
                    const user_update = {
                        matches: profile_matches,
                        likes: profile_likes
                    }
                    this.userRepo.updateProfile(user_update, profile.profileId);
                } else {
                    // If User is not yet liked by flat -> only set like on user profile
                    const user_update = {
                        likes: profile_likes
                    }
                    this.userRepo.updateProfile(user_update, profile.profileId);
                }
            } else {
                throw new Error("You cannot like a flat if isSearchingRoom is false")
            }
        } else {
            like = UserProfileConverter.convertDBEntryToProfile(like_response);
            // Check if user is advertising a room and like is searching a room
            if (profile.isAdvertisingRoom && like.isSearchingRoom) {

            } else {
                throw new Error("You can only like a User if isAdvertisingRoom is false or the user you liked is not searching")
            }
        }

        throw new Error("Not implemented")
    }
}
