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
        let converter;
        if(profile_id.split("#")[0] == "flt") {
            repo = this.flatRepo;
            converter = new FlatProfileConverter();
        } else {
            repo = this.userRepo;
            converter = new UserProfileConverter();
        }
        const db_entry = await repo.getProfileById(profile_id)
        // Convert references to actual profiles
        const dto = converter.convertDBEntryToProfile(db_entry).toJson()

        if (db_entry) {
            if(profile_id.split("#")[0] == "flt") {
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
        let like_converter: any;
        if (profile_id.split("#")[0] != "flt" && like_id.split("#")[0] == "flt") {
            like_repo = this.userRepo;
            like_converter = FlatProfileConverter;
        } else if (profile_id.split("#")[0] != "flt" && like_id.split("#")[0] != "flt") {
            like_repo = this.flatRepo;
            like_converter = UserProfileConverter;
        } else {
            throw new TypeError("Only User likes User and User likes Flat possible")
        }

        // Get Profile and Match

        await this.userRepo.getProfileById(profile_id).then((response) =>{
            const profile = UserProfileConverter.convertDBEntryToProfile(response);
        });
        await like_repo.getProfileById(profile_id).then().then((response) => {
           const liked_profile = like_converter.convertDBEntryToProfile(response);
        });


        throw new Error("Not implemented")
    }
}
