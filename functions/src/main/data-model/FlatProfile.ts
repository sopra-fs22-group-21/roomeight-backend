import { Like } from "./Like";
import { Profile } from "./Profile";
import { Status } from "./Status";
import { Tag } from "./Tag";

export class FlatProfile implements Profile {
    profileId: string;
    name: string;
    description: string;
    biography: string;
    tags: Tag[];
    pictureReference: string;
    likes: Like[];
    creationDate: Date;
    onlineStatus: Status;
    moveInDate: Date;
    moveOutDate: Date;
    address: string;
    rent: number;
    permanent: boolean;
    numberOfRoommates: number;
    roomSize: number;
    numberOfBaths: number;
    roomMates: string[];
    matches: string[];

    constructor(name: string, description: string, biography: string, tags: Tag[], pictureReference: string,
                likes: Like[], creationDate: Date, onlineStatus: Status, moveInDate: any, moveOutDate: any,
                address: string, rent: number, permanent: boolean, numberOfRoommates: number, roomSize: number,
                numberOfBaths: number, roomMates: string[], profile_id: string, matches: string[]) {
        this.name = name;
        this.description = description;
        this.biography = biography;
        this.tags = tags;
        this.pictureReference = pictureReference;
        this.likes = likes;
        this.creationDate = creationDate;
        this.onlineStatus = onlineStatus;
        this.moveInDate = moveInDate;
        this.moveOutDate = moveOutDate;
        this.address = address;
        this.rent = rent;
        this.permanent = permanent;
        this.numberOfRoommates = numberOfRoommates;
        this.roomSize = roomSize;
        this.numberOfBaths = numberOfBaths;
        this.roomMates = roomMates;
        this.profileId = profile_id;
        this.matches = matches;
    }

    toJson(): any {
        return {
            profileId: this.profileId,
            name: this.name,
            description: this.description,
            biography: this.biography,
            tags: this.tags,
            pictureReference: this.pictureReference,
            likes: this.likes,
            creationDate: this.creationDate,
            onlineStatus: this.onlineStatus,
            moveInDate: this.moveInDate,
            moveOutDate: this.moveOutDate,
            address: this.address,
            rent: this.rent,
            permanent: this.permanent,
            numberOfRoommates: this.numberOfRoommates,
            roomSize: this.roomSize,
            numberOfBaths: this.numberOfBaths,
            roomMates: this.roomMates,
            matches: this.matches
        };
    }

    toDbEntry(): any {
        let json_likes: any[] = [];
        this.likes.map((like) => json_likes.push(like.toJson()));
        return {
            profileId: this.profileId,
            name: this.name,
            description: this.description,
            biography: this.biography,
            tags: this.tags,
            pictureReference: this.pictureReference,
            likes: json_likes,
            creationDate: this.creationDate,
            onlineStatus: this.onlineStatus,
            moveInDate: this.moveInDate,
            moveOutDate: this.moveOutDate,
            address: this.address,
            rent: this.rent,
            permanent: this.permanent,
            numberOfRoommates: this.numberOfRoommates,
            roomSize: this.roomSize,
            numberOfBaths: this.numberOfBaths,
            roomMates: this.roomMates,
            matches: this.matches
        };
    }
    
}
