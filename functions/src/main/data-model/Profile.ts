import { Status } from "./Status";
import { Tag } from "./Tag";

export interface Profile {
    profileId: string
    description: string,
    biography: string,
    tags: Tag[],
    pictureReferences: string[],
    creationDate: Date,
    onlineStatus: Status,
    moveInDate: Date,
    moveOutDate: Date,
    matches: string[]

    toJson(): any,
    toDbEntry(): any
}
