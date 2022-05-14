import {ValidMockUserRepository} from "../main/repository/MockUserRepository";
import {ValidMockFlatRepository} from "../main/repository/MockFlatRepository";
import {FlatProfileDataService} from "../main/data-services/FlatProfileDataService";


// Mocks
jest.mock('uuid', () => {
    return {
        v4: jest.fn()
            .mockImplementationOnce(() => "1234")
    }
});

// Unit Tests

describe("FlatProfileDataService Test", () => {

    // Post Flat Profile Tests

    test('1 Test Valid Add FlatProfile Request', () => {
        // Create current date
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let current_date = mm + '/' + dd + '/' + yyyy;

        // Input
        const post_body = {
            name: "test_flat",
            address: "test_address",
            description: "test",
            biography: "test bio",
            rent: 100
        }
        const uid = "123";

        // Expected Output
        const expected_response = {
            profileId: "flt$1234",
            name: "test_flat",
            description: "test",
            biography: "test bio",
            tags: [],
            pictureReferences: [],
            likes: [],
            creationDate: new Date(current_date),
            onlineStatus: "ONLINE",
            moveInDate: null,
            moveOutDate: null,
            address: "test_address",
            rent: 100,
            permanent: false,
            numberOfRoommates: 1,
            roomSize: null,
            numberOfBaths: null,
            roomMates: {
                "123": {
                    profileId: "123",
                    firstName: "Mock first_name",
                    lastName: "Mock last_name",
                    description: "",
                    biography: "",
                    tags: [],
                    pictureReferences: [],
                    matches: [],
                    creationDate: new Date(0),
                    onlineStatus: "ONLINE",
                    birthday: new Date(0),
                    email: "test@test.com",
                    phoneNumber: "0795556677",
                    gender: "NOT SET",
                    isSearchingRoom: true,
                    isAdvertisingRoom: false,
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    flatId: "",
                    isComplete: false,
                    filters: {},
                    likes: []
                }
            },
            matches: {},
            addressCoordinates: {
                longitude: null,
                latitude: null
            }
        }


        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        return ds.addFlatProfile(post_body, uid).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('2 Test Invalid Input Add FlatProfile Request', () => {
        // Create current date
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let current_date = mm + '/' + dd + '/' + yyyy;

        // Input
        const post_body = {
            name: 0,
            description: "",
            biography: 1,
            tags: "",
            pictureReferences: "",
            moveInDate: new Date(current_date),
            moveOutDate: new Date(0),
            address: "",
            rent: "100",
            permanent: "false",
            numberOfRoommates: "1",
            roomSize: "3",
            numberOfBaths: "1",

        }
        const uid = "123";

        // Expected Output
        const expected_error_msg = "Errors:\n" +
            "Invalid name: Should be of type string and have less than 300 signs,\n" +
            "Invalid biography: Should be of type string and have less than 300 signs,\n" +
            "Invalid tags: Should be a string array,\n" +
            "invalid pictureReferences,\n" +
            "Invalid moveInDate: Expected Format: 1999-06-22,\n" +
            "Invalid moveOutDate: Expected Format: 1999-06-22,\n" +
            "Invalid rent: Should be of type number,\n" +
            "Invalid isSearchingRoom: has to be true or false (boolean),\n" +
            "Invalid roomSize: Should be of type number,\n" +
            "Invalid numberOfBaths: Should be of type number\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,addressCoordinates"


        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        return ds.addFlatProfile(post_body, uid)
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a validation error");
                }
            )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                }
            )
    });

    // GetById Tests

    test('3 Test Valid GetById Request', () => {
        const expected_response = "{" +
            "\"name\":\"test\"," +
            "\"description\":\"test\"," +
            "\"biography\":\"test\"," +
            "\"tags\":[\"test\"]," +
            "\"pictureReferences\":[\"test\"]," +
            "\"likes\":[]," +
            "\"creationDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"moveInDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"moveOutDate\":\"1970-01-01T00:00:00.000Z\"," +
            "\"address\":\"test\"," +
            "\"rent\":500," +
            "\"permanent\":false," +
            "\"roomSize\":18," +
            "\"numberOfBaths\":1," +
            "\"roomMates\":{}," +
            "\"matches\":{}," +
            "\"addressCoordinates\":{\"longitude\":12.34,\"latitude\":56.78}" +
            "}";
        const ds = new FlatProfileDataService(new ValidMockFlatRepository(), new ValidMockUserRepository());

        return ds.getProfileByIdFromRepo("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(expected_response);
            }
        );
    });
})
