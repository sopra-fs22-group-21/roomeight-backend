import {UserRepository} from "./UserRepository";
import {UserProfile} from "../data-model/UserProfile";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

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

    getProfileById(profile_id:string): Promise<any> {
        console.log("Entered Mock updateUserProfile");
        if (profile_id == "123-advertising") {
            return Promise.resolve({
                firstName: 'Mock first_name',
                moveInDate: new Timestamp(0, 0),
                likes: [],
                phoneNumber: '0795556677',
                flatId: '123',
                tags: [],
                isSearchingRoom: false,
                isAdvertisingRoom: true,
                biography: '',
                profileId: '123-advertising',
                gender: 'NOT SET',
                pictureReferences: [],
                birthday:  new Timestamp(0, 0),
                description: '',
                lastName: 'Mock last_name',
                onlineStatus: 'ONLINE',
                viewed: [],
                creationDate:  new Timestamp(0, 0),
                moveOutDate:  new Timestamp(0, 0),
                matches: [],
                email: 'test@test.com',
                filters: {},
                isComplete: false
            });
        }
        return Promise.resolve({
                firstName: 'Mock first_name',
                moveInDate: new Timestamp(0, 0),
                likes: [],
                phoneNumber: '0795556677',
                flatId: '',
                tags: [],
                isSearchingRoom: true,
                isAdvertisingRoom: false,
                biography: '',
                profileId: '123',
                gender: 'NOT SET',
                pictureReferences: [],
                birthday:  new Timestamp(0, 0),
                description: '',
                lastName: 'Mock last_name',
                onlineStatus: 'ONLINE',
                viewed: [],
                creationDate:  new Timestamp(0, 0),
                moveOutDate:  new Timestamp(0, 0),
                matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
                email: 'test@test.com',
                filters: {},
                isComplete: false
        });
    }

    getProfiles(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    getProfileByEmail(email: string): Promise<any> {
        if (email == "advertising@test.com") {
            return Promise.resolve({
                firstName: 'Mock first_name',
                moveInDate: new Timestamp(0, 0),
                likes: [],
                phoneNumber: '0795556677',
                flatId: '123',
                tags: [],
                isSearchingRoom: false,
                isAdvertisingRoom: true,
                biography: '',
                profileId: '123-advertising',
                gender: 'NOT SET',
                pictureReferences: [],
                birthday:  new Timestamp(0, 0),
                description: '',
                lastName: 'Mock last_name',
                onlineStatus: 'ONLINE',
                viewed: [],
                creationDate:  new Timestamp(0, 0),
                moveOutDate:  new Timestamp(0, 0),
                matches: [],
                email: 'test@test.com',
                filters: {},
                isComplete: false
            });
        }
        return Promise.resolve({
            firstName: 'Mock first_name',
            moveInDate: new Timestamp(0, 0),
            likes: [],
            phoneNumber: '0795556677',
            flatId: '',
            tags: [],
            isSearchingRoom: false,
            isAdvertisingRoom: false,
            biography: '',
            profileId: '',
            gender: 'NOT SET',
            pictureReferences: [],
            birthday:  new Timestamp(0, 0),
            description: '',
            lastName: 'Mock last_name',
            onlineStatus: 'ONLINE',
            viewed: [],
            creationDate:  new Timestamp(0, 0),
            moveOutDate:  new Timestamp(0, 0),
            matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
            email: 'test@test.com',
            filters: {},
            isComplete: false
        });
    }

    discover(queryConstraints: any[]): Promise<any> {
        return Promise.resolve(undefined);
    }

}

export class InvalidMockUserRepository implements UserRepository {
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

    addProfile(user_to_add: UserProfile): Promise<string> {
        console.log("Entered Mock invalid addUserProfile");
        return Promise.reject(new Error("Could not post User"));
    }

    deleteProfile(profileId: string): Promise<string> {
        console.log("Entered Mock invalid deleteUserProfile");
        return Promise.reject(new Error("Could not delete User"));
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        return Promise.reject(new Error("Could not update User"));
    }

    getProfileByEmail(email: string): Promise<any> {
        return Promise.resolve(undefined);
    }

    discover(queryConstraints: any[]): Promise<any> {
        return Promise.resolve(undefined);
    }

}
