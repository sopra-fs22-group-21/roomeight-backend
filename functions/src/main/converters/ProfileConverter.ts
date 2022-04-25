import {Profile} from "../data-model/Profile";

export interface ProfileConverter {
    convertPostDto(json_body: any): Profile;
    convertDBEntryToProfile(db_entry: any): Profile;
}
