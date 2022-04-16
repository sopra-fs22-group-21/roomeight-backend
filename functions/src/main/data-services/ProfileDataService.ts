import {ProfileQueryRepository} from "../repository/ProfileQueryRepository";
import {UserProfileConverter} from "../converters/UserProfileConverter";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {ReferenceConverter} from "../converters/ReferenceConverter";

export class ProfileDataService {

    // Todo: Clean up unresolved references
    static async getProfileByIdFromRepo(repo: ProfileQueryRepository, profile_id: string): Promise<string> {
        const db_entry = await repo.getProfileById(profile_id)
        let dto: any;
        if (db_entry._fieldsProto) {
            if(profile_id.split("#")[0] == "flt") {
                // Convert references to actual profiles
                dto = FlatProfileConverter.convertDBEntryToProfile(db_entry).toJson()

                const reference_converter = new ReferenceConverter(repo);
                await reference_converter.resolveSingleProfileReference(dto.likes.likedUserId)
                    .then((resolution) => {
                        dto.likes.likedUserId = resolution.result;
                    });
                await reference_converter.resolveProfileReferenceList(dto.matches)
                    .then((resolution) => {
                        dto.matches = resolution.result;
                    });
                await reference_converter.resolveProfileReferenceList(dto.roomMates)
                    .then((resolution) => {
                        dto.roomMates = resolution.result;
                    });

            } else {
                // Convert DB entry to user profile
                dto = UserProfileConverter.convertDBEntryToProfile(db_entry).toJson();

                // Convert references to actual profiles
                const reference_converter = new ReferenceConverter(repo);
                await reference_converter.resolveProfileReferenceList(dto.likes)
                    .then((resolution) => {
                        dto.likes = resolution.result;
                    });
                await reference_converter.resolveProfileReferenceList(dto.matches)
                    .then((resolution) => {
                        dto.matches = resolution.result;
                    });
                await reference_converter.resolveProfileReferenceList(dto.viewed)
                    .then((resolution) => {
                        dto.viewed = resolution.result;
                    });
            }
            return dto;

        } else {
            throw new Error("Profile not found!")
        }
    }
}
