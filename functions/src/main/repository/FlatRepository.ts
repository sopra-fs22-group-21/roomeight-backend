import {ProfileRepository} from "./ProfileRepository";
import {getFirestore} from "firebase-admin/firestore";
import {app} from "firebase-admin";
import App = app.App;
import {FlatProfile} from "../data-model/FlatProfile";
import * as functions from "firebase-functions";


export class FlatRepository implements ProfileRepository {
    database: any;
    collection_name: string;


    constructor(app: App) {
        this.database = getFirestore(app);
        this.collection_name = "flat-profiles"
    }

    getProfileById(profile_id:string): Promise<any> {
        return this.database.collection(this.collection_name).doc(profile_id).get()
            .then((response: any) => {
                return response.data()
            });
    }

    addProfile(flat_to_add: FlatProfile): Promise<string>  {
        // Add flat to database with set unique profile id
        functions.logger.debug(flat_to_add.toJson(), {structuredData: true})
        return this.database.collection(this.collection_name).doc(flat_to_add.profileId).set(flat_to_add.toDbEntry())
            .then((r: any) => {
                return r;
            });
    }

    updateProfile(update_fields: any, profile_id: string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).update(update_fields)
            .then((r: any) => {
                functions.logger.info(r, {structuredData: true});
                return "Successfully updated Flat with id: " + profile_id;
            });
    }

    deleteProfile(profile_id: string): Promise<string> {
        return this.database.collection(this.collection_name).doc(profile_id).delete()
            .then((r: any) => {
                functions.logger.info(r, {structuredData: true});
                return "Successfully deleted Flat with id: " + profile_id;
            });
    }
}
