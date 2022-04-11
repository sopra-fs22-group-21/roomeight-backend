// Mock Repository for db calls

import {UserRepository} from "./UserRepository";
import {UserProfile} from "../data-model/UserProfile";

export class ValidMockUserRepository implements UserRepository{
    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    collection_name: string;
    database: any;

    addUserProfile(user_to_add: UserProfile): Promise<string> {
        console.log("Entered Mock addUserProfile");
        return Promise.resolve("Successfully added " + user_to_add.email);
    }

    deleteUserProfile(profileId: string): Promise<string> {
        console.log("Entered Mock deleteUserProfile");
        return Promise.resolve("Successfully deleted user  " + profileId);
    }

    updateUserProfile(update_fields: any, profile_id: string): Promise<string> {
        console.log("Entered Mock updateUserProfile");
        return Promise.resolve("Successfully updated user  " + profile_id);
    }

}

export class InvalidMockUserRepository implements UserRepository{
    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    collection_name: string;
    database: any;

    addUserProfile(user_to_add: UserProfile): Promise<string> {
        console.log("Entered Mock invalid addUserProfile");
        return Promise.reject(new Error("Could not post User"));
    }

    deleteUserProfile(profileId: string): Promise<string> {
        console.log("Entered Mock invalid deleteUserProfile");
        return Promise.reject(new Error("Could not add User"));
    }

    updateUserProfile(update_fields: any, profile_id: string): Promise<string> {
        console.log("Entered Mock invalid updateUserProfile");
        return Promise.reject(new Error("Could not update User"));
    }

}
