
export interface ProfileQueryRepository {
    getProfileById(profile_id: string): Promise<any>;
}
