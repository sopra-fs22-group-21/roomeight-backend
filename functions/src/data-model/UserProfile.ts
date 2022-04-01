import { Gender } from "./Gender";
import { Match } from "./Match";
import { Profile } from "./Profile";
import { Status } from "./Status";
import { Tag } from "./Tag";

export class UserProfile implements Profile{
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
    birthday: string;
    emailAddress: string;
    phoneNumber: string;
    gender: Gender;
    isSearchingRoom: boolean;
    isAdvertisingRoom: boolean;

    constructor(name: string, description: string, biography: string, tags: Array<Tag>, pictureReference: string, matches: Array<Match>, creationDate: string, onlineStatus: Status, moveInDate: string, moveOutDate: string, birthday: string, emailAddress: string, phoneNumber: string, gender: Gender, isSearchingRoom: boolean, isAdvertisingRoom: boolean) {
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
        this.birthday = birthday;
        this.emailAddress = emailAddress;
        this.phoneNumber = phoneNumber;
        this.gender = gender;
        this.isSearchingRoom = isSearchingRoom;
        this.isAdvertisingRoom = isAdvertisingRoom;
    }
    
    toJsonString(): string {
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