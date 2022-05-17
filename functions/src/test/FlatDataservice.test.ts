import {InvalidMockUserRepository, ValidMockUserRepository} from "../main/repository/MockUserRepository";
import {InvalidMockFlatRepository, ValidMockFlatRepository} from "../main/repository/MockFlatRepository";
import {FlatProfileDataService} from "../main/data-services/FlatProfileDataService";
import {FlatValidator} from "../main/validation/FlatValidator";


// Mocks
jest.mock('uuid', () => {
    return {
        v4: jest.fn()
            .mockImplementationOnce(() => "1234")
    }
});

// Unit Tests

describe("FlatProfileDataService Post Profile Test", () => {

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
                    matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
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

        // Used Instances
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
            "invalid pictureReferences: Should be an array of strings,\n" +
            "Invalid moveInDate: Expected Format: 1999-06-22,\n" +
            "Invalid moveOutDate: Expected Format: 1999-06-22,\n" +
            "Invalid rent: Should be of type number,\n" +
            "Invalid permanent: Has to be true or false (boolean),\n" +
            "Invalid roomSize: Should be of type number,\n" +
            "Invalid numberOfBaths: Should be of type number\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,addressCoordinates"

        // Used Instances
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
            );
    });

    test('3 Test Invalid Add FlatProfile Request - Already in flat', () => {
        // Input
        const post_body = {
            name: "test_flat",
            address: "test_address",
            description: "test",
            biography: "test bio",
            rent: 100
        }
        const uid = "123-advertising";

        // Expected Output
        const expected_error_msg = "User is already part of a flat"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        return ds.addFlatProfile(post_body, uid)
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a flat-exists error");
                }
            )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                }
            );
    });
});

describe("FlatProfileDataService Delete Profile Test", () => {

    test('4 Test Valid Delete Flat Request', () => {
        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Input
        const profile_id = "flt$1234"
        const uid = "123-advertising"

        // Expected Output
        const expected_response = "Successfully deleted flat flt$1234"

        return ds.deleteFlat(profile_id, uid).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('5 Test Invalid Delete Flat Request - Flat not found', () => {
        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Input
        const profile_id = "flt$1234"
        const uid = "123-advertising"

        // Expected Output
        const expected_error_msg = "Flat Profile not found"

        return ds.deleteFlat(profile_id, uid).then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a profile not found error");
                }
            )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                }
            );
    });

    // Post Flat Profile Tests
    test('6 Test Invalid Delete Flat Request - User not part of flat', () => {
        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Input
        const profile_id = "flt$1234"
        const uid = "123"

        // Expected Output
        const expected_error_msg = "User is not authorized to delete the selected flat!"

        return ds.deleteFlat(profile_id, uid).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a authorization error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                }
            );
    });
});

describe("FlatProfileDataService Get Profile Test", () => {

    test('7 Test Valid GetById Request', () => {
        // Expected Output
        const expected_response = {
            name: "test",
            description: "test",
            biography: "test",
            tags: ["test"],
            pictureReferences: ["test"],
            likes: [],
            creationDate: new Date(0),
            moveInDate: new Date(0),
            moveOutDate: new Date(0),
            address: "test",
            rent: 500,
            permanent: false,
            roomSize: 18,
            numberOfBaths: 1,
            roomMates: {
                "123-advertising": {
                    profileId: "123-advertising",
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
                    isSearchingRoom: false,
                    isAdvertisingRoom: true,
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    flatId: "123",
                    isComplete: false,
                    filters: {},
                    likes: []
                }
            },
            matches: {
                "123": {
                    profileId: "123",
                    firstName: "Mock first_name",
                    lastName: "Mock last_name",
                    description: "",
                    biography: "",
                    tags: [],
                    pictureReferences: [],
                    matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
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
            addressCoordinates: {
                longitude: 12.34,
                latitude: 56.78
            }
        }

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        return ds.getProfileByIdFromRepo("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('8 Test Valid GetProfilesFromRepo Request', () => {
        // Expected Output
        const expected_response = [{
            name: "test",
            description: "test",
            biography: "test",
            tags: ["test"],
            pictureReferences: ["test"],
            likes: [],
            creationDate: new Date(0),
            moveInDate: new Date(0),
            moveOutDate: new Date(0),
            address: "test",
            rent: 500,
            permanent: false,
            roomSize: 18,
            numberOfBaths: 1,
            roomMates: {
                "123-advertising": {
                    profileId: "123-advertising",
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
                    isSearchingRoom: false,
                    isAdvertisingRoom: true,
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    flatId: "123",
                    isComplete: false,
                    filters: {},
                    likes: []
                }
            },
            matches: {
                "123": {
                    profileId: "123",
                    firstName: "Mock first_name",
                    lastName: "Mock last_name",
                    description: "",
                    biography: "",
                    tags: [],
                    pictureReferences: [],
                    matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
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
            addressCoordinates: {
                longitude: 12.34,
                latitude: 56.78
            }
        }]

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        return ds.getProfilesFromRepo().then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('9 Test Invalid GetById Request - Flat not found', () => {
        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Expected Output
        const expected_error_msg = "Flat Profile not found!"

        return ds.getProfileByIdFromRepo("123").then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile-not-found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                }
            );
    });
});

describe("FlatProfileDataService Patch Profile Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('10 Test Valid Patch Request', () => {
        // Setup Spies
        jest.spyOn(FlatValidator, 'validatePatchFlat');
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Input
        const update_body = {
            description: "updated desc",
            biography: "updated bio",
            tags: ["SPORTS"],
            pictureReferences: ["updatedPRef"],
            onlineStatus: "OFFLINE",
            moveInDate: new Date(1).toString(),
            moveOutDate: new Date(2).toString(),
            rent: 200,
            permanent: true,
            roomSize: 30,
            numberOfBaths: 4,
            numberOfRoommates: 4,
            name: "updated name",
            address: "updated address",
            addressCoordinates: {
                latitude: 43.21,
                longitude: 98.76
            }
        }
        const uid = "123-advertising"
        const flat_id = "flt$1234"

        // Expected Output
        const expected_response = {
            name: "test",
            description: "test",
            biography: "test",
            tags: ["test"],
            pictureReferences: ["test"],
            likes: [],
            creationDate: new Date(0),
            moveInDate: new Date(0),
            moveOutDate: new Date(0),
            address: "test",
            rent: 500,
            permanent: false,
            roomSize: 18,
            numberOfBaths: 1,
            roomMates: {
                "123-advertising": {
                    profileId: "123-advertising",
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
                    isSearchingRoom: false,
                    isAdvertisingRoom: true,
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    flatId: "123",
                    isComplete: false,
                    filters: {},
                    likes: []
                }
            },
            matches: {
                "123": {
                    profileId: "123",
                    firstName: "Mock first_name",
                    lastName: "Mock last_name",
                    description: "",
                    biography: "",
                    tags: [],
                    pictureReferences: [],
                    matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
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
            addressCoordinates: {
                longitude: 12.34,
                latitude: 56.78
            }
        }

        return ds.updateFlat(update_body, flat_id, uid).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(FlatValidator.validatePatchFlat).toBeCalledTimes(1);
                expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(2);
                // Two of the three times of the updateProfile calls come from the reference resolver
                expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(3);
            }
        )
    });

    test('11 Test Invalid Patch Request - Validation Errors', () => {
        // Setup Spies
        jest.spyOn(FlatValidator, 'validatePatchFlat');
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');

        // Input
        const update_body = {
            description: 0,
            biography: 0,
            tags: ["INVALID_TAG"],
            pictureReferences: "updatedPRef",
            onlineStatus: "OFLINE",
            moveInDate: new Date(1),
            moveOutDate: new Date(2),
            rent: "200",
            permanent: "true",
            roomSize: "30",
            numberOfBaths: "4",
            numberOfRoommates: "4",
            name: 0,
            address: "",
            addressCoordinates: {
                latitude: "43.21",
                longitude: "98.76"
            }
        }
        const uid = "123-advertising"
        const flat_id = "flt$1234"

        // Expected Output
        const expected_error_msg = "Errors:\n" +
            "Invalid description: Should be of type string and have less than 300 signs,\n" +
            "Invalid biography: Should be of type string and have less than 300 signs,\n" +
            "Invalid tag: INVALID_TAG is not a valid tag. Valid tags are: COOKING,SPORTS,INSTRUMENTS,CLEANLINESS," +
                "STUDENT,WORKING,PETS,PARTY,COFFEE,WINE,WOKO,JUWO,PEACEFUL,SMOKER,\n" +
            "invalid pictureReferences: Should be an array of strings,\n" +
            "Invalid moveInDate: Expected Format: 1999-06-22,\n" +
            "Invalid moveOutDate: Expected Format: 1999-06-22,\n" +
            "Invalid rent: Should be of type number,\n" +
            "Invalid permanent: Has to be true or false (boolean),\n" +
            "Invalid roomSize: Should be of type number,\n" +
            "Invalid numberOfBaths: Should be of type number,\n" +
            "Invalid name: Should be of type string and have less than 300 signs,\n" +
            "Invalid addressCoordinates: Should contain latitude and longitude, both of type number\n" +
            "Mandatory fields are: \n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate," +
                "rent,permanent,roomSize,numberOfBaths,numberOfRoommates,name,address,addressCoordinates"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        return ds.updateFlat(update_body, flat_id, uid)
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a validation error");
                }
            )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(FlatValidator.validatePatchFlat).toBeCalledTimes(1);
                    expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(0);
                    expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );
    });

    test('12 Test Invalid Update Flat Request - Flat not found', () => {
        // Setup Spies
        jest.spyOn(FlatValidator, 'validatePatchFlat');
        jest.spyOn(InvalidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockFlatRepository.prototype, 'updateProfile');

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Input
        const update_body = {
            description: "updated desc",
            biography: "updated bio"
        }
        const profile_id = "flt$1234"
        const uid = "123-advertising"

        // Expected Output
        const expected_error_msg = "Flat Profile not found"

        return ds.updateFlat(update_body,profile_id, uid).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(FlatValidator.validatePatchFlat).toBeCalledTimes(1);
                    expect(InvalidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(InvalidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );
    });

    test('13 Test Invalid Update Flat Request - User not in flat', () => {
        // Setup Spies
        jest.spyOn(FlatValidator, 'validatePatchFlat');
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Input
        const update_body = {
            description: "updated desc",
            biography: "updated bio"
        }
        const profile_id = "flt$1234"
        const uid = "123"

        // Expected Output
        const expected_error_msg = "User is not authorized to delete the selected flat!"

        return ds.updateFlat(update_body,profile_id, uid).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(FlatValidator.validatePatchFlat).toBeCalledTimes(1);
                    expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );
    });
});

describe("FlatProfileDataService FlatMate Operations Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('14 Test Valid add user to flat', () => {
        // Prepare spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123";
        const mate_email = "test@test.com";

        // Expected Output
        const expected_response = "Successfully added user with mail test@test.com to flat test"

        return ds.addUserToFlat(uid, mate_email).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(2);
                expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(2);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(1);
            });

    });

    test('15 Test Invalid add user to flat - User not found', () => {
        // Prepare spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(InvalidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123";
        const mate_email = "test@test.com";

        // Expected Output
        const expected_error_msg = "User Profile with id 123 not found"

        return ds.addUserToFlat(uid, mate_email).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(0);
                    expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(InvalidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(InvalidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );

    });

    test('15 Test Invalid add user to flat - New mate already part of a flat', () => {
        // Prepare spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123-advertising";
        const mate_email = "advertising@test.com";

        // Expected Output
        const expected_error_msg = "User (new Mate) with email advertising@test.com is already part of a flat"

        return ds.addUserToFlat(uid, mate_email).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );

    });

    test('15 Test Invalid add user to flat - User not found', () => {
        // Prepare spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(InvalidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123";
        const mate_email = "test@test.com";

        // Expected Output
        const expected_error_msg = "User Profile with id 123 not found"

        return ds.addUserToFlat(uid, mate_email).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(0);
                    expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(InvalidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(InvalidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );

    });

    test('16 Test Invalid add user to flat - Cannot find flat', () => {
        // Prepare spies
        jest.spyOn(InvalidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123-advertising";
        const mate_email = "test@test.com";

        // Expected Output
        const expected_error_msg = "Could not find flat 123 where user should be added"

        return ds.addUserToFlat(uid, mate_email).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(InvalidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(InvalidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );

    });

    test('17 Test Valid delete roommate from flat', () => {
        // Prepare spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123-advertising";

        // Expected Output
        const expected_response = "Successfully removed user with 123-advertising from flat test"

        return ds.deleteUserFromFlat(uid).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
                expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(1);
            });

    });

    test('18 Test Invalid remove user from flat - Cannot find flat', () => {
        // Prepare spies
        jest.spyOn(InvalidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123-advertising";

        // Expected Output
        const expected_error_msg = "Could not find flat 123 where user should be removed"

        return ds.deleteUserFromFlat(uid).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(InvalidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(InvalidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );

    });

    test('15 Test Invalid add user to flat - User not found', () => {
        // Prepare spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(InvalidMockUserRepository.prototype, 'updateProfile');


        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new FlatProfileDataService(flat_repo, user_repo);

        // Inputs
        const uid = "123";

        // Expected Output
        const expected_error_msg = "User Profile with id 123 not found"

        return ds.deleteUserFromFlat(uid).then(
            (response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            }
        )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(0);
                    expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(InvalidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(InvalidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                }
            );

    });
});
