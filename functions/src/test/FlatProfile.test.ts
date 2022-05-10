import {FlatProfile} from "../main/data-model/FlatProfile";
import {Status} from "../main/data-model/Status";
import {Coordinates} from "../main/data-model/Coordinates";

describe('Flat profile test', () => {
    let flatProfile: FlatProfile;

    beforeEach(() => {
        flatProfile = new FlatProfile("test", "test", "test", [], [], [],
            new Date(0), Status.online, new Date(0), new Date(0), "test teststrasse 3, 8032 zuerich",
            500, false, 5, 18, 1, [], "testId",
            [], new Coordinates(12.34, 56.78));
    });

    test('Test getJson of profile', () => {
        let expected = "{" +
            "\"profileId\":\"testId\"," +
            "\"name\":\"test\"," +
            "\"description\":\"test\"," +
            "\"biography\":\"test\"," +
            "\"tags\":[]," +
            "\"pictureReferences\":[]," +
            "\"likes\":[]," +
            "\"creationDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"onlineStatus\":\"ONLINE\"," +
            "\"moveInDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"moveOutDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"address\":\"test teststrasse 3, 8032 zuerich\"," +
            "\"rent\":500," +
            "\"permanent\":false," +
            "\"numberOfRoommates\":5," +
            "\"roomSize\":18," +
            "\"numberOfBaths\":1," +
            "\"roomMates\":[]," +
            "\"matches\":[]," +
            "\"addressCoordinates\":{" +
            "\"longitude\":12.34," +
            "\"latitude\":56.78" +
            "}" +
            "}"

        expect(JSON.stringify(flatProfile.toJson())).toEqual(expected);
    })
})
