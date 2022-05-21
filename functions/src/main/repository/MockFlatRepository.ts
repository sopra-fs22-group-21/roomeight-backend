import {FlatRepository} from "./FlatRepository";
import { FlatProfile } from "../data-model/FlatProfile";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;


export class ValidMockFlatRepository implements FlatRepository {

    collection_name: string;
    database: any;

    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    addProfile(flat_to_add: FlatProfile): Promise<string> {
        console.log("Entered Mock addFlatProfile");
        return Promise.resolve("Successfully added " + flat_to_add.name);    }

    getProfiles(): Promise<any> {
        console.log("Entered Mock getFlatProfiles");
        return Promise.resolve([{
            name: "test",
            address: "test",
            description: "test",
            biography: "test",
            tags: ["test"],
            pictureReferences: ["test"],
            moveInDate: new Timestamp(0, 0),
            moveOutDate: new Timestamp(0, 0),
            rent: 500,
            permanent: false,
            roomSize: 18,
            numberOfBaths: 1,
            roomMates: ["123-advertising"],
            likes: [],
            matches: ["123"],
            profileId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
            creationDate: new Timestamp(0, 0),
            addressCoordinates: {
                longitude: 12.34,
                latitude: 56.78
            }
        }]);
    }

    deleteProfile(profile_id: string): Promise<string> {
        console.log("Entered Mock deleteFlatProfile");
        return Promise.resolve("Successfully deleted flat " + profile_id);
    }

    getProfileById(profile_id: string): any {
        console.log("Entered Mock getFlatProfileById");
        return Promise.resolve({
            name: "test",
            address: "test",
            description: "test",
            biography: "test",
            tags: ["test"],
            pictureReferences: ["test"],
            moveInDate: new Timestamp(0, 0),
            moveOutDate: new Timestamp(0, 0),
            rent: 500,
            permanent: false,
            roomSize: 18,
            numberOfBaths: 1,
            roomMates: ["123-advertising"],
            likes: [
                {
                    likes: ["123-advertising"],
                    likedUser: "456"
                }
            ],
            matches: [],
            profileId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
            creationDate: new Timestamp(0, 0),
            addressCoordinates: {
                longitude: 12.34,
                latitude: 56.78
            }
        });
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        console.log("Entered Mock updateFlatProfile");
        return Promise.resolve("Successfully updated flat " + profile_id);
    }

    getProfileByEmail(email: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    discover(queryConstraints: any[]): Promise<any> {
        return Promise.resolve(undefined);
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
        console.log("Entered Mock invalid addFlatProfile");
        return Promise.reject(new Error("Could not post Flat"));
    }

    deleteProfile(profileId: string): Promise<string> {
        console.log("Entered Mock invalid deleteFlatProfile");
        return Promise.reject(new Error("Could not delete Flat"));
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        return Promise.reject(new Error("Could not update Flat"));
    }

    getProfileByEmail(email: string): Promise<any> {
        throw new Error("Not implemented")
    }

    discover(queryConstraints: any[]): Promise<any> {
        throw new Error("Not implemented")
    }
}
