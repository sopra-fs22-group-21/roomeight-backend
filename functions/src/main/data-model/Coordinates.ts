
export class Coordinates {
    longitude: number;
    latitude: number;

    constructor(longitude: number, latitude: number) {
        this.longitude = longitude;
        this.latitude = latitude;
    }

    toJson(): any {
        return {
            longitude: this.longitude,
            latitude: this.latitude
        }
    }
}
