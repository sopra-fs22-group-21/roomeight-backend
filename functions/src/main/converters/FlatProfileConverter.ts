import {FlatProfile} from "../data-model/FlatProfile";
import {Status} from "../data-model/Status";
import {Address} from "../data-model/Address";

export class FlatProfileConverter {

    // Dynamically converts a json body of a post user request to a userprofile object
    static convertPostDto(json_body: any, uid: string): FlatProfile {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let current_date = mm + '/' + dd + '/' + yyyy;
        let address = new Address(json_body.address.street, json_body.address.city, json_body.address.province,
            json_body.address.postalCode, json_body.address.country);


        // Create Template userprofile with default values and mandatory fields
        // ToDo insert new Address from json_body
        let flat = new FlatProfile(json_body.name, "", "", [], "",
            [], new Date(current_date), Status.online, new Date(NaN), new Date(NaN),
            address, NaN, false, NaN,  NaN, NaN, [uid], "", [])

        // Check if optional fields are in the json body
        if (json_body.hasOwnProperty("description")) {
            flat.description = json_body.description;
        }
        if (json_body.hasOwnProperty("biography")) {
            flat.biography = json_body.biography;
        }
        if (json_body.hasOwnProperty("tags")) {
            flat.tags = json_body.tags.split(",");
        }
        if (json_body.hasOwnProperty("description")) {
            flat.description = json_body.description;
        }
        if (json_body.hasOwnProperty("pictureReference")) {
            flat.pictureReference = json_body.pictureReference;
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

        return flat;
    }

}
