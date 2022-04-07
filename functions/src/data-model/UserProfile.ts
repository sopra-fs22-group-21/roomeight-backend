import {Gender} from "./Gender";
import {Profile} from "./Profile";
import {Status} from "./Status";
import {Tag} from "./Tag";


export class UserProfile implements Profile{
    profileId: string;
    first_name: string;
    last_name: string;
    description: string;
    biography: string;
    tags: Tag[];
    pictureReference: string;
    matches: string[];
    viewed: string[];
    likes: string[];
    creationDate: Date;
    onlineStatus: Status;
    moveInDate: Date;
    moveOutDate: Date;
    birthday: Date;
    emailAddress: string;
    phoneNumber: string;
    gender: Gender;
    isSearchingRoom: boolean;
    isAdvertisingRoom: boolean;
    flatId: string;

    constructor(first_name: string, last_name: string, description: string, biography: string, tags: Array<Tag>,
                pictureReference: string, matches: string[], creationDate: Date, onlineStatus: Status,
                moveInDate: Date, moveOutDate: Date, birthday: Date, emailAddress: string, phoneNumber: string,
                gender: Gender, isSearchingRoom: boolean, isAdvertisingRoom: boolean, viewed: string[], flatId: string,
                likes: string[], profile_id: string) {
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
        this.viewed = viewed;
        this.flatId = flatId;
        this.likes = likes;
        this.profileId = profile_id;
    }

    toJson(): any {
        return {
            ProfileType: "User",
            ProfileId: this.profileId,
            FirstName: this.first_name,
            LastName: this.last_name,
            Description: this.description,
            Biography: this.biography,
            Tags: this.tags,
            PictureReference: this.pictureReference,
            Matches: this.matches,
            Viewed: this.viewed,
            Likes: this.likes,
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
