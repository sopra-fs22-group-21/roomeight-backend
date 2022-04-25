
export class Like {
    likes: string[];
    likedUser: string;

    constructor(likesUserIds: string[], likedUserId: string) {
        this.likes = likesUserIds;
        this.likedUser = likedUserId;
    }

    toJson(): any {
        return {
            likes: this.likes,
            likedUser: this.likedUser
        }
    }
}
