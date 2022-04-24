import {UserProfile} from "../data-model/UserProfile";
import {Status} from "../data-model/Status";
import {Gender} from "../data-model/Gender";
import {Tag} from "../data-model/Tag";
// import {Profile} from "../data-model/Profile";

export class UserProfileConverter {

    // Dynamically converts a json body of a post user request to a userprofile object
    static convertPostDto(json_body: any): UserProfile {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let current_date = mm + '/' + dd + '/' + yyyy;

        // Todo: Nullable dates
        // Create Template userprofile with default values and mandatory fields
        let user = new UserProfile(json_body.firstName, json_body.lastName, "", "", [],
                      "", [], new Date(current_date), Status.online, new Date(0),
                                    new Date(0), new Date(json_body.birthday), json_body.email, json_body.phoneNumber,
                                    Gender.notSet, true, false, [], "", [],
                            "")

        // Check if optional fields are in the json body
        if (json_body.hasOwnProperty("description")) {
            user.description = json_body.description;
        }
        if (json_body.hasOwnProperty("biography")) {
            user.biography = json_body.biography;
        }
        if (json_body.hasOwnProperty("tags")) {
            user.tags = json_body.tags.split(",");
        }
        if (json_body.hasOwnProperty("description")) {
            user.description = json_body.description;
        }
        if (json_body.hasOwnProperty("pictureReference")) {
            user.pictureReference = json_body.pictureReference;
        }
        if (json_body.hasOwnProperty("gender")) {
            user.gender = json_body.gender;
        }
        if (json_body.hasOwnProperty("moveInDate")) {
            user.moveInDate = new Date(Date.parse(json_body.moveInDate));
        }
        if (json_body.hasOwnProperty("moveOutDate")) {
            user.moveOutDate = new Date(Date.parse(json_body.moveOutDate));
        }
        if (json_body.hasOwnProperty("isSearchingRoom")) {
            user.isSearchingRoom = json_body.isSearchingRoom == "True";
        }
        if (json_body.hasOwnProperty("isAdvertisingRoom")) {
            user.isAdvertisingRoom = json_body.isAdvertisingRoom == "True";
        }

        return user;
    }

    // Dynamically converts DB entry to a valid UserProfile
    static convertDBEntryToProfile(db_entry: any): UserProfile {
        try {
            // Define Vars
            const fields = db_entry._fieldsProto;
            let tags: Tag[] = [];
            let viewed: string[] = [];
            let likes: string[] = [];
            let matches: string[] = [];

            // Build arrays
            fields.tags.arrayValue.values.map((tag: any) => {tags.push(tag.stringValue)});
            fields.viewed.arrayValue.values.map((viewed_user: any) => {viewed.push(viewed_user.stringValue)});
            fields.likes.arrayValue.values.map((like: any) => {likes.push(like.stringValue)});
            fields.matches.arrayValue.values.map((match: any) => {matches.push(match.stringValue)});

            return new UserProfile(fields.firstName.stringValue, fields.lastName.stringValue, fields.description.stringValue,
                fields.biography.stringValue, tags, fields.pictureReference.stringValue,
                matches, new Date(fields.creationDate.timestampValue.seconds), fields.onlineStatus.stringValue,
                new Date(fields.moveInDate.timestampValue.seconds), new Date(fields.moveOutDate.timestampValue.seconds),
                new Date(fields.birthday.timestampValue.seconds), fields.email.stringValue, fields.phoneNumber.stringValue,
                fields.gender.stringValue, fields.isSearchingRoom.booleanValue, fields.isAdvertisingRoom.booleanValue,
                viewed, fields.flatId.stringValue, likes, fields.profileId.stringValue)

        } catch (e) {
            throw new TypeError("DB entry does not have expected format: " + e)
        }
    }


}
