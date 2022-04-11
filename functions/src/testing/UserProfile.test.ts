import {UserProfile} from "../data-model/UserProfile";
import {Status} from "../data-model/Status";
import {Gender} from "../data-model/Gender";

describe('ValidatorReport test', () => {
    let userProfile: UserProfile;

    beforeEach(() => {
        userProfile = new UserProfile("test", "test", "", "", [],
            "", [], new Date(0), Status.online, new Date(0),
            new Date(0), new Date(0), "lars.boesch@uzh.ch", "+41799127396",
            Gender.notSet, true, false, [], "", [],
            "");
    });

    test('new report should not contain errors', () => {
        let expected = "{\"profileId\":\"\"," +
            "\"firstName\":\"test\"," +
            "\"lastName\":\"test\"," +
            "\"description\":\"\"," +
            "\"biography\":\"\"," +
            "\"tags\":[]," +
            "\"pictureReference\":\"\"," +
            "\"matches\":[]," +
            "\"viewed\":[]," +
            "\"likes\":[]," +
            "\"creationDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"onlineStatus\":\"ONLINE\"," +
            "\"birthday\":\"1970-01-01T00:00:00.000Z\"," +
            "\"email\":\"lars.boesch@uzh.ch\"," +
            "\"phoneNumber\":\"+41799127396\"," +
            "\"gender\":\"NOT SET\"," +
            "\"isSearchingRoom\":true," +
            "\"isAdvertisingRoom\":false," +
            "\"moveInDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"moveOutDate\":\"1970-01-01T00:00:00.000Z\"}"

        expect(JSON.stringify(userProfile.toJson())).toEqual(expected);
    })
})