import {UserProfile} from "../data-model/UserProfile";
import {Status} from "../data-model/Status";
import {Gender} from "../data-model/Gender";


export class UserProfileConverter{

    // Dynamically converts a json body of a post user request to a userprofile object
    static convertPostDto(json_body: any): UserProfile {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let current_date = mm + '/' + dd + '/' + yyyy;

        // Create Template userprofile with default values and mandatory fields
        let user = new UserProfile(json_body.firstName, json_body.lastName, "", "", [],
                                    [], [], new Date(current_date), Status.online, null,
                                    null, new Date(json_body.birthday), json_body.email, json_body.phoneNumber,
                                    Gender.notSet, true, false, [], "", [],
                                    "", false, {"matchingTimeRange": true}, []);

        // Check if optional fields are in the json body
        if (json_body.hasOwnProperty("description")) {
            user.description = json_body.description;
        }
        if (json_body.hasOwnProperty("biography")) {
            user.biography = json_body.biography;
        }
        if (json_body.hasOwnProperty("tags")) {
            user.tags = json_body.tags;
        }
        if (json_body.hasOwnProperty("description")) {
            user.description = json_body.description;
        }
        if (json_body.hasOwnProperty("pictureReferences")) {
            user.pictureReferences = json_body.pictureReferences;
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
        if (json_body.hasOwnProperty("isComplete")) {
            user.isComplete = json_body.isComplete;
        }

        return user;
    }

    // Dynamically converts DB entry to a valid UserProfile
    static convertDBEntryToProfile(db_entry: any): UserProfile {
        try {
            return new UserProfile(db_entry.firstName, db_entry.lastName, db_entry.description, db_entry.biography,
                db_entry.tags, db_entry.pictureReferences, db_entry.matches, db_entry.creationDate.toDate(),
                db_entry.onlineStatus, db_entry.moveInDate ? db_entry.moveInDate.toDate():null,
                db_entry.moveOutDate ? db_entry.moveOutDate.toDate():null, db_entry.birthday.toDate(),
                db_entry.email, db_entry.phoneNumber, db_entry.gender, db_entry.isSearchingRoom,
                db_entry.isAdvertisingRoom, db_entry.viewed, db_entry.flatId, db_entry.likes, db_entry.profileId,
                db_entry.isComplete, db_entry.filters, db_entry.devicePushTokens);

        } catch (e) {
            throw new TypeError("DB entry does not have expected format: " + e);
        }
    }


}
