import {FlatProfile} from "../data-model/FlatProfile";
import {Status} from "../data-model/Status";
import {Like} from "../data-model/Like";


export class FlatProfileConverter{

    // Dynamically converts a json body of a post user request to a userprofile object
    static convertPostDto(json_body: any): FlatProfile {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let current_date = mm + '/' + dd + '/' + yyyy;

        // Create Template userprofile with default values and mandatory fields
        let flat = new FlatProfile(json_body.name, "", "", [], [],
            [], new Date(current_date), Status.online, null, null, json_body.address, NaN,
            false, 1,  NaN, NaN, [json_body.user_uid], "", [],
            "")

        // Check if optional fields are in the json body
        if (json_body.hasOwnProperty("description")) {
            flat.description = json_body.description;
        }
        if (json_body.hasOwnProperty("biography")) {
            flat.biography = json_body.biography;
        }
        if (json_body.hasOwnProperty("tags")) {
            flat.tags = json_body.tags;
        }
        if (json_body.hasOwnProperty("description")) {
            flat.description = json_body.description;
        }
        if (json_body.hasOwnProperty("pictureReferences")) {
            flat.pictureReferences = json_body.pictureReferences;
        }
        if (json_body.hasOwnProperty("moveInDate")) {
            flat.moveInDate = new Date(Date.parse(json_body.moveInDate));
        }
        if (json_body.hasOwnProperty("moveOutDate")) {
            flat.moveOutDate = new Date(Date.parse(json_body.moveOutDate));
        }
        if (json_body.hasOwnProperty("rent")) {
            flat.rent = json_body.rent;
        }
        if (json_body.hasOwnProperty("permanent")) {
            flat.permanent = json_body.permanent;
        }
        if (json_body.hasOwnProperty("numberOfRoommates")) {
            flat.numberOfRoommates = json_body.numberOfRoommates;
        }
        if (json_body.hasOwnProperty("roomSize")) {
            flat.roomSize = json_body.roomSize;
        }
        if (json_body.hasOwnProperty("numberOfBaths")) {
            flat.numberOfBaths = json_body.numberOfBaths;
        }
        if (json_body.hasOwnProperty("addressCoordinates")) {
            flat.addressCoordinates = json_body.addressCoordinates
        }

        return flat;
    }

    // Dynamically converts DB entry to a valid FlatProfile
    static convertDBEntryToProfile(db_entry: any): FlatProfile {
        let likes: Like[] = [];
        db_entry.likes.map((like: any) => likes.push(new Like(like.likes, like.likedUser)));
        try {
            return new FlatProfile(db_entry.name, db_entry.description, db_entry.biography, db_entry.tags,
                db_entry.pictureReferences, likes, db_entry.creationDate.toDate(), db_entry.onlineStatus,
                db_entry.moveInDate ? db_entry.moveInDate.toDate():null,
                db_entry.moveOutDate ? db_entry.moveOutDate.toDate():null, db_entry.address, db_entry.rent,
                db_entry.permanent, db_entry.numberOfRoommates, db_entry.roomSize, db_entry.numberOfBaths,
                db_entry.roomMates, db_entry.profileId, db_entry.matches, db_entry.addressCoordinates);

        } catch (e) {
            throw new TypeError("DB entry does not have expected format" + e)
        }
    }
}
