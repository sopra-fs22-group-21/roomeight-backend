import { Status } from "./Status";
import { Tag } from "./Tag";
import { UserProfile } from "./UserProfile";

// Todo: add id
export interface Profile {
    profileId: string
    description: string,
    biography: string,
    tags: Tag[],
    pictureReference: string,
    creationDate: Date,
    onlineStatus: Status,
    moveInDate: Date,
    moveOutDate: Date,
    matches: string[]

    toJson(): any,
    getMatches(): Array<UserProfile>,
    match(user: UserProfile): void
}
