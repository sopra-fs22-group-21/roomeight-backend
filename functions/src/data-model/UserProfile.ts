import {Gender} from "./Gender";
import {Match} from "./Match";
import {Profile} from "./Profile";
import {Status} from "./Status";
import {Tag} from "./Tag";

export class UserProfile implements Profile{
    first_name: string;
    last_name: string;
    description: string;
    biography: string;
    tags: Tag[];
    pictureReference: string;
    matches: Match[];
    mismatches: string[];
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

    constructor(first_name: string, last_name: string, description: string, biography: string, tags: Array<Tag>,
                pictureReference: string, matches: Array<Match>, creationDate: string, onlineStatus: Status,
                moveInDate: string, moveOutDate: string, birthday: string, emailAddress: string, phoneNumber: string,
                gender: Gender, isSearchingRoom: boolean, isAdvertisingRoom: boolean, mismatch: string[]) {
        this.first_name = first_name;
        this.last_name = last_name;
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
        this.mismatches = mismatch;
    }

    toJson(): any {
        return {
            ProfileType: "User",
            FirstName: this.first_name,
            LastName: this.last_name,
            Description: this.description,
            Biography: this.biography,
            Tags: this.tags,
            PictureReference: this.pictureReference,
            Matches: this.matches,
            Mismatches: this.mismatches,
            CreationDate: this.creationDate,
            OnlineStatus: this.onlineStatus,
            Birthday: this.birthday,
            EmailAddress: this.emailAddress,
            PhoneNumber: this.phoneNumber,
            Gender: this.gender,
            IsSearchingRoom: this.isSearchingRoom,
            IsAdvertisingRoom: this.isAdvertisingRoom,
            MoveInDate: this.moveInDate,
            MoveOutDate: this.moveOutDate
        };
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
