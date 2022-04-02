import { Match } from "./Match";
import { Status } from "./Status";
import { Tag } from "./Tag";
import { UserProfile } from "./UserProfile";

export interface Profile {
    description: string,
    biography: string,
    tags: Array<Tag>,
    pictureReference: string,
    matches: Array<Match>,
    creationDate: string,
    onlineStatus: Status,
    moveInDate: string,
    moveOutDate: string

    toJson(): { FirstName: string; LastName: string },
    getMatches(): Array<UserProfile>,
    getMisMatches(): Array<UserProfile>,
    match(user: UserProfile): void
}
