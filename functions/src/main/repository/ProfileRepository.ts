import {Profile} from "../data-model/Profile";

export interface ProfileRepository {
    getProfileById(profile_id: string): Promise<any>;
    addProfile(profile_to_add: Profile): Promise<string>;
    updateProfile(update_fields: any, profile_id: string): Promise<string>;
    deleteProfile(profile_id: string): Promise<string>;
}
