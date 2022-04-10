import {UserProfile} from "../data-model/UserProfile";
import {Status} from "../data-model/Status";
import {Gender} from "../data-model/Gender";

export class UserProfileConverter {

    // Dynamically converts a json body of a post user request to a userprofile object
    static convertPostDto(json_body: any): UserProfile {
        // Create Template userprofile with default values and mandatory fields
        let user = new UserProfile(json_body.firstName, json_body.lastName, "", "", [],
                      "", [], new Date(0), Status.online, new Date(0),
                                    new Date(0), json_body.birthday, json_body.email, json_body.phoneNumber,
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

}
