import {Repository} from "../repository/Repository";

export class ProfileDataService {
    addUserProfile() {
        const repository = new Repository();
        repository.addUserProfile("test", "test", "test", "test", "test",
                              "test", "test", "test", "test",
                                    "test", "test", "test", "test",
                             "test", "test", "test", "test")
    }
}
