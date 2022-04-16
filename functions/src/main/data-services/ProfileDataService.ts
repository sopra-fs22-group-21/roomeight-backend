import {ProfileQueryRepository} from "../repository/ProfileQueryRepository";
import {UserProfileConverter} from "../converters/UserProfileConverter";

export class ProfileDataService {

    static async getProfileByIdFromRepo(repo: ProfileQueryRepository, profile_id: string): Promise<string> {

        return await repo.getProfileById(profile_id)
            .then((response) => {
                if (response._fieldsProto) {
                    if(profile_id.split("#")[0] == "flt") {
                        throw new Error("Not implemented")
                    } else {
                        return UserProfileConverter.convertDBEntryToProfile(response).toJson();
                    }
                } else {
                    throw new Error("Profile not found!")
                }
            });
    }
}
