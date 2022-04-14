import {ProfileQueryRepository} from "../repository/ProfileQueryRepository";

export class ProfileDataService {

    static getProfileByIdFromRepo(repo: ProfileQueryRepository, profile_id: string): Promise<string> {
        throw new Error("Not implemented")
    }
}
