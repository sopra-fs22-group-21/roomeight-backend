import {Profile} from "../data-model/Profile";

export interface ProfileQueryInterface {
    getProfileById(): Profile;
}
