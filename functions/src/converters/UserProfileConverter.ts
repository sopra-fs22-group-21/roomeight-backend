import {UserProfile} from "../data-model/UserProfile";
import {Status} from "../data-model/Status";
import {Gender} from "../data-model/Gender";

export class UserProfileConverter {

    static convertPostDto(json_body: any): UserProfile {
        let user = new UserProfile(json_body.FirstName, json_body.LastName, "", "", [],
                      "", [], new Date(0), Status.online, new Date(0),
                                    new Date(0), json_body.Birthday, json_body.EmailAddress, json_body.PhoneNumber,
                                    Gender.notSet, true, false, [], "", [],
                            "")

        if (json_body.hasOwnProperty("Description")) {
            user.description = json_body.Description;
        }
        if (json_body.hasOwnProperty("Biography")) {
            user.biography = json_body.Biography;
        }
        if (json_body.hasOwnProperty("Tags")) {
            user.tags = json_body.Tags.split(",");
        }
        if (json_body.hasOwnProperty("Description")) {
            user.description = json_body.Description;
        }
        if (json_body.hasOwnProperty("PictureReference")) {
            user.pictureReference = json_body.PictureReference;
        }
        if (json_body.hasOwnProperty("Gender")) {
            user.gender = json_body.Gender;
        }
        if (json_body.hasOwnProperty("MoveInDate")) {
            user.moveInDate = new Date(Date.parse(json_body.MoveInDate));
        }
        if (json_body.hasOwnProperty("MoveOutDate")) {
            user.moveOutDate = new Date(Date.parse(json_body.MoveOutDate));
        }
        if (json_body.hasOwnProperty("IsSearchingRoom")) {
            user.isSearchingRoom = json_body.IsSearchingRoom == "True";
        }
        if (json_body.hasOwnProperty("IsAdvertisingRoom")) {
            user.isAdvertisingRoom = json_body.isAdvertisingRoom == "True";
        }

        return user;
    }

}
