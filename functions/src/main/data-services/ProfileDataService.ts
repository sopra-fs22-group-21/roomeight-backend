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
        let dto: any;

        if (db_entry) {
            if(profile_id.split("#")[0] == "flt") {
                // Convert references to actual profiles
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
                // Convert DB entry to user profile
                dto = UserProfileConverter.convertDBEntryToProfile(db_entry).toJson();

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

    async matchProfile(profile_id: string, like_id: string): Promise<string> {
        // Define repos for requests
        // let profile_repo: ProfileRepository;
        // let match_repo: ProfileRepository;
        // if (profile_id.split("#")[0] == "flt" && like_id.split("#")[0] != "flt") {
        //     profile_repo = this.flatRepo;
        //     match_repo = this.userRepo;
        // } else if (profile_id.split("#")[0] != "flt" && like_id.split("#")[0] == "flt") {
        //     profile_repo = this.userRepo;
        //     match_repo = this.flatRepo;
        // } else {
        //     throw new TypeError("You can only match a profile with a different Typ and both profiles must have type User or Flat" +
        //                          "e.g. a User Profile can only match a Flat Profile")
        // }
        //
        // // Get Profile and Match
        // const profile = await profile_repo.getProfileById(profile_id);
        // const match = await match_repo.getProfileById(profile_id);

        throw new Error("Not implemented")
    }
}
