import { Address } from "./Address";
import { Like } from "./Like";
import { Profile } from "./Profile";
import { Status } from "./Status";
import { Tag } from "./Tag";
import { UserProfile } from "./UserProfile";


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
    address: Address;
    rent: Number;
    permanent: boolean;
    numberOfRoommates: number;
    roomSize: number;
    numberOfBaths: number;
    roomMates: string[];
    matches: string[];

    constructor(name: string, description: string, biography: string, tags: Tag[], pictureReference: string,
                likes: Like[], creationDate: Date, onlineStatus: Status, moveInDate: Date, moveOutDate: Date,
                address: Address, rent: Number, permanent: boolean, numberOfRoommates: number, roomSize: number,
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

    getMatches(): UserProfile[] {
        throw new Error("Method not implemented.");
    }
    match(user: UserProfile): void {
        throw new Error("Method not implemented.");
    }
    
}
