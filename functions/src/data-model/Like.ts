import { UserProfile } from "./UserProfile";

export class Like {
    likes: Array<UserProfile>;
    likedUser: UserProfile;

    constructor(likes: Array<UserProfile>, matchedUser: UserProfile) {
        this.likes = likes;
        this.likedUser = matchedUser;
    }
}
