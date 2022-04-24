import {UserRepository} from "./UserRepository";
import {UserProfile} from "../data-model/UserProfile";

// Mock Repository for db calls

export class ValidMockUserRepository implements UserRepository {
    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    collection_name: string;
    database: any;

    addProfile(user_to_add: UserProfile): Promise<string> {
        console.log("Entered Mock addUserProfile");
        return Promise.resolve("Successfully added " + user_to_add.email);
    }

    deleteProfile(profileId: string): Promise<string> {
        console.log("Entered Mock deleteUserProfile");
        return Promise.resolve("Successfully deleted user " + profileId);
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        console.log("Entered Mock updateUserProfile");
        return Promise.resolve("Successfully updated user " + profile_id);
    }

    getProfileById(profile_id:string): Promise<string> {
        throw new Error("Method not implemented.");
    }

}

export class InvalidMockUserRepository implements UserRepository {
    collection_name: string;
    database: any;

    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    getProfileById(profile_id:string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    addProfile(user_to_add: UserProfile): Promise<string> {
        console.log("Entered Mock invalid addUserProfile");
        return Promise.reject(new Error("Could not post User"));
    }

    deleteProfile(profileId: string): Promise<string> {
        console.log("Entered Mock invalid deleteUserProfile");
        return Promise.reject(new Error("Could not delete User"));
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        console.log("Entered Mock invalid updateUserProfile");
        return Promise.reject(new Error("Could not update User"));
    }

}
