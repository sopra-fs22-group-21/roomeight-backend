import { Status } from "./Status";
import { Tag } from "./Tag";
import { UserProfile } from "./UserProfile";

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
    toDbEntry(): any,
    // Todo: Remove getMatches() and match()
    getMatches(): UserProfile[],
    match(user: UserProfile): void
}
