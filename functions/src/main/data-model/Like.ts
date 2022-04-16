
export class Like {
    likesUserIds: string[];
    likedUserId: string;

    constructor(likesUserIds: string[], likedUserId: string) {
        this.likesUserIds = likesUserIds;
        this.likedUserId = likedUserId;
    }
}
