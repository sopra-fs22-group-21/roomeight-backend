import {ProfileQueryRepository} from "./ProfileQueryRepository";
import {getFirestore} from "firebase-admin/firestore";
import {app} from "firebase-admin";
import App = app.App;


export class FlatRepository implements ProfileQueryRepository {
    database: any;
    collection_name: string;


    constructor(app: App) {
        this.database = getFirestore(app);
        this.collection_name = "flat-profiles"
    }

    getProfileById(): any {
    }
}
