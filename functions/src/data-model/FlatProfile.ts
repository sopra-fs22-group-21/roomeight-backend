import { Address } from "./Address";
import { Match } from "./Match";
import { Profile } from "./Profile";
import { Status } from "./Status";
import { Tag } from "./Tag";
import { UserProfile } from "./UserProfile";

export class FlatProfile implements Profile {
    name: string;
    description: string;
    biography: string;
    tags: Tag[];
    pictureReference: string;
    matches: Match[];
    creationDate: string;
    onlineStatus: Status;
    moveInDate: string;
    moveOutDate: string;
    address: Address;
    rent: Number;
    permanent: boolean;
    numberOfRoommates: number;
    roomSize: number;
    numberOfBaths: number;
    roomMates: Array<UserProfile>;

    constructor(name: string, description: string, biography: string, tags: Tag[], pictureReference: string, matches: Match[], creationDate: string, onlineStatus: Status, moveInDate: string, moveOutDate: string, address: Address, rent: Number, permanent: boolean, numberOfRoommates: number, roomSize: number, numberOfBaths: number, roomMates: Array<UserProfile>) {
        this.name = name;
        this.description = description;
        this.biography = biography;
        this.tags = tags;
        this.pictureReference = pictureReference;
        this.matches = matches;
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
    }

    toJson(): { FirstName: string; LastName: string } {
        throw new Error("Method not implemented.");
    }
    getMatches(): UserProfile[] {
        throw new Error("Method not implemented.");
    }
    getMisMatches(): UserProfile[] {
        throw new Error("Method not implemented.");
    }
    match(user: UserProfile): void {
        throw new Error("Method not implemented.");
    }
    
}
