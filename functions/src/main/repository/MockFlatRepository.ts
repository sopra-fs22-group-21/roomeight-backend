import {FlatRepository} from "./FlatRepository";
import { FlatProfile } from "../data-model/FlatProfile";


export class ValidMockFlatRepository implements FlatRepository {

    collection_name: string;
    database: any;

    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    addProfile(flat_to_add: FlatProfile): Promise<string> {
        throw new Error("Method not implemented.");
    }

    getProfiles(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    deleteProfile(profile_id: string): Promise<string> {
        return Promise.resolve("");
    }

    getProfileById(profile_id: string): any {
        return Promise.resolve("");
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        return Promise.resolve("");
    }
}

export class InvalidMockFlatRepository implements FlatRepository {
    collection_name: string;
    database: any;

    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    getProfileById(profile_id:string): Promise<any> {
        console.log("Entered Mock invalid getProfileById");
        return Promise.resolve(undefined);
    }

    getProfiles(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    addProfile(flat_to_add: FlatProfile): Promise<string> {
        console.log("Entered Mock invalid addUserProfile");
        return Promise.reject(new Error("Could not post Flat"));
    }

    deleteProfile(profileId: string): Promise<string> {
        console.log("Entered Mock invalid deleteUserProfile");
        return Promise.reject(new Error("Could not delete Flat"));
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        return Promise.reject(new Error("Could not update Flat"));
    }
}
