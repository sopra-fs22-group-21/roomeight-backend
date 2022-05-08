import {FlatProfile} from "../main/data-model/FlatProfile";
import {Status} from "../main/data-model/Status";

describe('ValidatorReport test', () => {
    let userProfile: FlatProfile;

    beforeEach(() => {
        userProfile = new FlatProfile("test", "test", "test", [], [], [],
            new Date(0), Status.online, new Date(0), new Date(0), "test teststrasse 3, 8032 zuerich",
            500, false, 5, 18, 1, [], "testId",
            [], "12.34.56");
    });

    test('new report should not contain errors', () => {
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
            "\"addressCoordinates\":\"12.34.56\"}"

        expect(JSON.stringify(userProfile.toJson())).toEqual(expected);
    })
})
