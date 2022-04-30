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
    pictureReferences: string[];
    matches: string[];
    viewed: string[];
    likes: string[];
    creationDate: Date;
    onlineStatus: Status;
    moveInDate: Date;
    moveOutDate: Date;
    birthday: Date;
    email: string;
    phoneNumber: string;
    gender: Gender;
    isSearchingRoom: boolean;
    isAdvertisingRoom: boolean;
    flatId: string;
    isComplete: boolean;

    constructor(first_name: string, last_name: string, description: string, biography: string, tags: Array<Tag>,
                pictureReferences: string[], matches: string[], creationDate: Date, onlineStatus: Status,
                moveInDate: any, moveOutDate: any, birthday: Date, email: string, phoneNumber: string,
                gender: Gender, isSearchingRoom: boolean, isAdvertisingRoom: boolean, viewed: string[], flatId: string,
                likes: string[], profile_id: string, isComplete: boolean) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.description = description;
        this.biography = biography;
        this.tags = tags;
        this.pictureReferences = pictureReferences;
        this.matches = matches;
        this.creationDate = creationDate;
        this.onlineStatus = onlineStatus;
        this.moveInDate = moveInDate;
        this.moveOutDate = moveOutDate;
        this.birthday = birthday;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.gender = gender;
        this.isSearchingRoom = isSearchingRoom;
        this.isAdvertisingRoom = isAdvertisingRoom;
        this.viewed = viewed;
        this.flatId = flatId;
        this.likes = likes;
        this.profileId = profile_id;
        this.isComplete = isComplete;
    }

    toJson(): any {
        return {
            profileId: this.profileId,
            firstName: this.first_name,
            lastName: this.last_name,
            description: this.description,
            biography: this.biography,
            tags: this.tags,
            pictureReferences: this.pictureReferences,
            matches: this.matches,
            creationDate: this.creationDate,
            onlineStatus: this.onlineStatus,
            birthday: this.birthday,
            email: this.email,
            phoneNumber: this.phoneNumber,
            gender: this.gender,
            isSearchingRoom: this.isSearchingRoom,
            isAdvertisingRoom: this.isAdvertisingRoom,
            moveInDate: this.moveInDate,
            moveOutDate: this.moveOutDate,
            flatId: this.flatId,
            isComplete: this.isComplete
        };
    }

    toDbEntry(): any {
        return {
            profileId: this.profileId,
            firstName: this.first_name,
            lastName: this.last_name,
            description: this.description,
            biography: this.biography,
            tags: this.tags,
            pictureReferences: this.pictureReferences,
            matches: this.matches,
            viewed: this.viewed,
            likes: this.likes,
            creationDate: this.creationDate,
            onlineStatus: this.onlineStatus,
            birthday: this.birthday,
            email: this.email,
            phoneNumber: this.phoneNumber,
            gender: this.gender,
            isSearchingRoom: this.isSearchingRoom,
            isAdvertisingRoom: this.isAdvertisingRoom,
            moveInDate: this.moveInDate,
            moveOutDate: this.moveOutDate,
            flatId: this.flatId,
            isComplete: this.isComplete
        };
    }
}
