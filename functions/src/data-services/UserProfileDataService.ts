import {Repository} from "../repository/Repository";

export class UserProfileDataService {
    static addUserProfile(body: any) {
        const repository = new Repository();
        repository.addUserProfile("test", "test", "test", "test", "test",
            "test", "test", "test", "test",
            "test", "test", "test", "test",
            "test", "test", "test", "test")
    }
}
