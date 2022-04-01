import { UserProfile } from "./UserProfile";

export class Match {
    likes: Array<UserProfile>;
    matchedUser: UserProfile;

    constructor(likes: Array<UserProfile>, matchedUser: UserProfile) {
        this.likes = likes;
        this.matchedUser = matchedUser;
    }
}