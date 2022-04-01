import { Match } from "./Match";
import { Status } from "./Status";
import { Tag } from "./Tag";
import { UserProfile } from "./UserProfile";

export interface Profile {
    name: string,
    description: string,
    biography: string,
    tags: Array<Tag>,
    pictureReference: string,
    matches: Array<Match>,
    creationDate: string,
    onlineStatus: Status,
    moveInDate: string,
    moveOutDate: string

    toJsonString(): string,
    getMatches(): Array<UserProfile>,
    getMisMatches(): Array<UserProfile>,
    match(user: UserProfile): void
}
