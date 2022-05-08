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
    pictureReferences: string[];
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
    addressCoordinates: string;

    constructor(name: string, description: string, biography: string, tags: Tag[], pictureReferences: string[],
                likes: Like[], creationDate: Date, onlineStatus: Status, moveInDate: any, moveOutDate: any,
                address: string, rent: number, permanent: boolean, numberOfRoommates: number, roomSize: number,
                numberOfBaths: number, roomMates: string[], profile_id: string, matches: string[],
                addressCoordinates: string) {
        this.name = name;
        this.description = description;
        this.biography = biography;
        this.tags = tags;
        this.pictureReferences = pictureReferences;
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
        this.addressCoordinates = addressCoordinates
    }

    toJson(): any {
        return {
            profileId: this.profileId,
            name: this.name,
            description: this.description,
            biography: this.biography,
            tags: this.tags,
            pictureReferences: this.pictureReferences,
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
            matches: this.matches,
            addressCoordinates: this.addressCoordinates
        };
    }

    toDbEntry(): any {
        return {
            profileId: this.profileId,
            name: this.name,
            description: this.description,
            biography: this.biography,
            tags: this.tags,
            pictureReferences: this.pictureReferences,
            likes: this.likes.map((like) => like.toJson()),
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
            matches: this.matches,
            addressCoordinates: this.addressCoordinates
        };
    }
    
}
