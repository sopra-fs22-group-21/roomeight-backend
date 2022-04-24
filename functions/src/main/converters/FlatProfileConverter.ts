import {FlatProfile} from "../data-model/FlatProfile";
import {Status} from "../data-model/Status";
import {Tag} from "../data-model/Tag";
import {Like} from "../data-model/Like";

export class FlatProfileConverter {

    // Dynamically converts a json body of a post user request to a userprofile object
    static convertPostDto(json_body: any, uid: string): FlatProfile {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let current_date = mm + '/' + dd + '/' + yyyy;
        // let address = new Address(json_body.address.street, json_body.address.city, json_body.address.province,
        //     json_body.address.postalCode, json_body.address.country);
        let address = JSON.stringify(json_body.address);


        // Create Template userprofile with default values and mandatory fields
        let flat = new FlatProfile(json_body.name, "", "", [], "",
            [], new Date(current_date), Status.online, new Date(), new Date(),
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

    // Dynamically converts DB entry to a valid FlatProfile
    static convertDBEntryToProfile(db_entry: any): FlatProfile {
        try {
            // Define Vars
            const fields = db_entry._fieldsProto;
            let tags: Tag[] = [];
            let matches: string[] = [];
            let room_mates: string[] = [];
            let likes: Like[] = [];

            let temp_likes: string[];

            // Build arrays
            fields.tags.arrayValue.values.map((tag: any) => {tags.push(tag.stringValue)});
            fields.roomMates.arrayValue.values.map((mate: any) => {room_mates.push(mate.stringValue)});
            fields.likes.arrayValue.values.map((like: any) => {
                temp_likes = [];
                like.likesUserIds.arrayValue.values.map((user_id: any) =>{
                    temp_likes.push(user_id.stringValue);
                });
                likes.push(new Like(temp_likes, like.likedUserId.stringValue))
            });
            fields.matches.arrayValue.values.map((match: any) => {matches.push(match.stringValue)});

            return new FlatProfile(fields.name.stringValue, fields.description.stringValue, fields.biography.stringValue,
                tags, fields.pictureReference.stringValue, likes, new Date(fields.creationDate.timestampValue.seconds),
                fields.onlineStatus.stringValue, new Date(fields.moveInDate.timestampValue.seconds),
                new Date(fields.moveOutDate.timestampValue.seconds), fields.address.stringValue, fields.rent.stringValue,
                fields.permanent.booleanValue, fields.numberOfRoommates.numberValue, fields.roomSize.numberValue,
                fields.numberOfBaths.numberValue, room_mates, fields.profileId.stringValue, matches)

        } catch (e) {
            throw new TypeError("DB entry does not have expected format")
        }
    }
}
