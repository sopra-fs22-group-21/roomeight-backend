import {ProfileRepository} from "../repository/ProfileRepository";
import {UserProfileConverter} from "../converters/UserProfileConverter";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {ReferenceController} from "../ReferenceHandling/ReferenceController";

export class ProfileDataService {

    userRepo;
    flatRepo;
    user_converter;

    constructor(user_repo: ProfileRepository, flat_repo: ProfileRepository) {
        this.userRepo = user_repo;
        this.flatRepo = flat_repo;
        this.user_converter = new UserProfileConverter();
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
        // let like_repo: ProfileRepository;
        // let like_converter: ProfileConverter;
        // if (profile_id.split("#")[0] != "flt" && like_id.split("#")[0] == "flt") {
        //     like_repo = this.userRepo;
        //     like_converter = new FlatProfileConverter();
        // } else if (profile_id.split("#")[0] != "flt" && like_id.split("#")[0] != "flt") {
        //     like_repo = this.flatRepo;
        //     like_converter = new UserProfileConverter();
        // } else {
        //     throw new TypeError("Only User likes User and User likes Flat possible")
        // }
        //
        // // Get Profile and Match
        //
        // await this.userRepo.getProfileById(profile_id).then((response) =>{
        //     const profile = this.user_converter.convertDBEntryToProfile(response);
        // });
        // await like_repo.getProfileById(profile_id).then().then((response) => {
        //    const liked_profile = like_converter.convertDBEntryToProfile(response);
        // });


        throw new Error("Not implemented")
    }
}
