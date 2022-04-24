import {UserRepository} from "./UserRepository";
import {UserProfile} from "../data-model/UserProfile";
import {firestore} from "firebase-admin";
import Timestamp = firestore.Timestamp;

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
          pictureReference: '',
          birthday:  new Timestamp(0, 0),
          description: '',
          lastName: 'Mock last_name',
          onlineStatus: 'ONLINE',
          viewed: [],
          creationDate:  new Timestamp(0, 0),
          moveOutDate:  new Timestamp(0, 0),
          matches: [],
          email: 'test@test.com'
        });
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
        return Promise.reject(new Error("Could not find User"));
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
