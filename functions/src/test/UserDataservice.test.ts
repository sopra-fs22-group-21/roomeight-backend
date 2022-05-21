import {UserProfileDataService} from "../main/data-services/UserProfileDataService";
import {InvalidMockUserRepository, ValidMockUserRepository} from "../main/repository/MockUserRepository";
import {InvalidMockFlatRepository, ValidMockFlatRepository} from "../main/repository/MockFlatRepository";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {UserValidator} from "../main/validation/UserValidator";


// Declaring mocks

jest.mock('firebase/auth', () => {
    const userCredentialMock = {
        user: {
            email: 'test@test.ch',
            uid: '123',
        }
    }
    return {
        getAuth: jest.fn(),
        createUserWithEmailAndPassword: jest.fn()
            // Value for first test
            .mockReturnValueOnce(Promise.resolve(userCredentialMock))
            // Value for second test
                //Not needed for second test
            // Value for third test
            .mockReturnValueOnce(Promise.reject("Firebase: Error (auth/email-already-in-use)."))
            // Value for fourth tests
            .mockReturnValueOnce(Promise.resolve(userCredentialMock)),
        deleteUser: jest.fn()
            // Default Value
            .mockReturnValue(Promise.resolve("Successfully deleted user"))
    }
});

jest.mock('firebase-admin', () => {
    return {
        auth: jest.fn()
            // Value for first test
                //Not needed for first test
            // Value for second test
                //Not needed for second test
            // Value for third test
                //Not needed for third test
            // Value for fourth tests
                //Not needed for fourth test
            // Value for fifth tests
                //Not needed for fifth test
            // Value for sixth tests
                //Not needed for sixth test
            // Value for seventh tests
                //Not needed for seventh test
            // Value for eighth test
            .mockImplementationOnce(() => new mockAdminAuth())
            // Value for ninth test
            .mockImplementationOnce(() => new invalidMockAdminAuth())
            // Value for tenth test
            .mockImplementationOnce(() => new mockAdminAuth())
    }
});

// Mock Expo Push Client
jest.mock('../main/clients/ExpoPushClient');


// mock admin-auth

class mockAdminAuth {
    constructor() {}

    deleteUser(profile_id: string): Promise<string> {
        return Promise.resolve("Successfully deleted user " + profile_id);
    }
}

class invalidMockAdminAuth {
    constructor() {}

    deleteUser(profile_id: string): Promise<string> {
        return Promise.reject(new Error("Could not delete auth User"));
    }
}

// Stub inputs

class StubInputs {
    // Stub inputs

    static getValidUserPostBody(): any {
        return {
            firstName: "test",
            lastName: "test",
            birthday: "1999-06-22",
            email: "test@test.ch",
            phoneNumber: "0795553030",
            password: StubInputs.generatePW(6)
        }
    }

    private static generatePW(length: number): string {
        let pw = "";
        for ( let i = 0; i < length; i++ ) {
            pw += "1"
        }
        return pw;
    }

    static getValidUpdateBody(): any {
        return {
            firstName: "updatedName",
            lastName: "updatedName"
        }
    }

    static getCurrentDateStr(): string {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        return  mm + '/' + dd + '/' + yyyy;
    }
}


// Unit Tests

describe("UserProfileDataService Post Profile Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1 Test Valid Add UserProfile Request', () => {
        // Setup Spies
        jest.spyOn(UserValidator, 'validatePostUser');
        jest.spyOn(ValidMockUserRepository.prototype, 'addProfile');

        // Expected output
        const expected_response = {
            profileId: "123",
            firstName: "test",
            lastName: "test",
            description: "",
            biography: "",
            tags: [],
            pictureReferences: [],
            matches: {},
            creationDate: new Date(StubInputs.getCurrentDateStr()),
            onlineStatus: "ONLINE",
            birthday: "1999-06-22T00:00:00.000Z",
            email: "test@test.ch",
            phoneNumber: "0795553030",
            gender: "NOT SET",
            isSearchingRoom: true,
            isAdvertisingRoom: false,
            moveInDate: new Date(NaN),
            moveOutDate: new Date(NaN),
            flatId: "",
            isComplete: false,
            filters: {matchingTimeRange: true},
            likes: []
        }

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.addUserProfile(StubInputs.getValidUserPostBody()).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(createUserWithEmailAndPassword).toBeCalledTimes(1);
                expect(UserValidator.validatePostUser).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.addProfile).toBeCalledTimes(1);
            }
        );
    });

    test('2 Test Validator Error Add UserProfile Request', () => {
        // This test should only examine the correct returning of an error message in case of a validation error
        // -> This is why only a single invalid input is tested
        // -> To examine the correct behaviour of the validator there exists a separate test file

        // Setup Spies
        jest.spyOn(UserValidator, 'validatePostUser');
        jest.spyOn(ValidMockUserRepository.prototype, 'addProfile');

        // Input setup
        let invalid_input = StubInputs.getValidUserPostBody();
        invalid_input.email = "invalid_email"

        // Expected Output
        const expected_response = "Errors:\nInvalid email\n" +
            "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
            "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,isComplete"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.addUserProfile(invalid_input)
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a validation error");
                }
            )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_response);
                    expect(createUserWithEmailAndPassword).toBeCalledTimes(0);
                    expect(UserValidator.validatePostUser).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.addProfile).toBeCalledTimes(0);
                }
            )
    });

    test('3 Test UserAlreadyExists Error Add UserProfile Request', () => {
        // Setup Spies
        jest.spyOn(UserValidator, 'validatePostUser');
        jest.spyOn(ValidMockUserRepository.prototype, 'addProfile');

        // Expected output
        const expected_response = "Firebase: Error (auth/email-already-in-use)."

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.addUserProfile(StubInputs.getValidUserPostBody())
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a userAlreadyExists error");
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(expected_response);
                    expect(createUserWithEmailAndPassword).toBeCalledTimes(1);
                    expect(UserValidator.validatePostUser).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.addProfile).toBeCalledTimes(0);
                }
            )
    });

    jest.clearAllMocks();

    test('4 Test Cannot access Repo Add UserProfile Request', async () => {
        // Setup Spies
        jest.spyOn(UserValidator, 'validatePostUser');
        jest.spyOn(ValidMockUserRepository.prototype, 'addProfile');

        // Expected output
        const expected_response = "Could not post user due to: Could not post User"

        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.addUserProfile(StubInputs.getValidUserPostBody())
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a repo error");
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(new Error(expected_response));
                    expect(createUserWithEmailAndPassword).toBeCalledTimes(1);
                    expect(UserValidator.validatePostUser).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.addProfile).toBeCalledTimes(0);
                }
            )
    });
});


describe("UserProfileDataService Patch Profile Test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('5 Test Valid Patch  UserProfile Request', () => {
        // Setup Spies
        jest.spyOn(UserValidator, 'validatePatchUser');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');

        // Expected output
        const expected_response = {
            profileId: "123",
            firstName: 'Mock first_name',
            lastName: 'Mock last_name',
            description: '',
            biography: '',
            tags: [],
            pictureReferences: [],
            matches: {
                "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb": {
                    profileId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
                    name: "test",
                    description: "test",
                    biography: "test",
                    tags: ["test"],
                    pictureReferences: ["test"],
                    likes: [
                        {
                            likes: ["123-advertising"],
                            likedUser: "456"
                        }
                    ],
                    creationDate: new Date(0),
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    address: "test",
                    rent: 500,
                    permanent: false,
                    roomSize: 18,
                    numberOfBaths: 1,
                    roomMates: ["123-advertising"],
                    matches: [],
                    addressCoordinates: {
                        longitude: 12.34,
                        latitude: 56.78
                    }
                }
            },
            creationDate: new Date(0),
            onlineStatus: 'ONLINE',
            birthday: new Date(0),
            email: 'test@test.com',
            phoneNumber: '0795556677',
            gender: 'NOT SET',
            isSearchingRoom: true,
            isAdvertisingRoom: false,
            moveInDate: new Date(0),
            moveOutDate: new Date(0),
            flatId: '',
            isComplete: false,
            filters: {},
            likes: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"]
        }

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.updateUser(StubInputs.getValidUpdateBody(), "123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(UserValidator.validatePatchUser).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
            }
        );
    });

    test('6 Test Validator Error Patch UserProfile Request', () => {
        // This test should only examine the correct returning of an error message in case of a validation error
        // -> This is why only a single invalid input is tested
        // -> To examine the correct behaviour of the validator there exists a separate test file

        // Setup Spies
        jest.spyOn(UserValidator, 'validatePatchUser');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');

        // Expected output
        const expected_response = "Errors:\nInvalid phoneNumber\n" +
            "Mandatory fields are: \n" +
            "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate," +
            "firstName,lastName,birthday,phoneNumber,email,flatId,isComplete,filters"
        let invalid_input = StubInputs.getValidUpdateBody();
        invalid_input.phoneNumber = "0"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.updateUser(invalid_input, "123")
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a validation error");
                }
            )
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_response);
                    expect(UserValidator.validatePatchUser).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(0);
                }
            )
    });

    test('7 Test Cannot access Repo Patch UserProfile Request', async () => {
        // Setup Spies
        jest.spyOn(UserValidator, 'validatePatchUser');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');

        // Expected output
        const expected_response = "Error: something went wrong and User was not updated: Could not update User"

        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.updateUser(StubInputs.getValidUpdateBody(), "123")
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a repo error");
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(new Error(expected_response));
                    expect(UserValidator.validatePatchUser).toBeCalledTimes(1);
                    expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(0);
                }
            )
    });
});

describe("UserProfileDataService Delete Profile Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('8 Test Valid Delete UserProfile Request', () => {
        // Setup Spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'deleteProfile');

        // Expected output
        const expected_response = "Successfully deleted user 123"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.deleteUser("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.deleteProfile).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(1);
                expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
            }
        );
    });

    test('9 Test Cannot access Auth Delete UserProfile Request', async () => {
        // Setup Spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'deleteProfile');

        // Expected output
        const expected_response = "Could not delete auth User"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.deleteUser("123")
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a auth error");
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(new Error(expected_response));
                    expect(ValidMockUserRepository.prototype.deleteProfile).toBeCalledTimes(0);
                    expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(1);
                    expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
                }
            )
    });

    test('10 Test Cannot access Repo Delete UserProfile Request', async () => {
        // Setup Spies
        jest.spyOn(InvalidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(InvalidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(InvalidMockUserRepository.prototype, 'deleteProfile');

        // Expected output
        const expected_response = "User Profile not found!"

        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.deleteUser("123")
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a repo error");
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(new Error(expected_response));
                    expect(InvalidMockUserRepository.prototype.deleteProfile).toBeCalledTimes(0);
                    expect(InvalidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(InvalidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(0);
                    expect(InvalidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(0);
                }
            )
    });
});


describe("UserProfileDataService Get Profiles Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('11 Test Valid GetById Request', () => {
        // Setup Spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');

        // Expected output
        const expected_response = {
            profileId: '123',
            firstName: 'Mock first_name',
            lastName: 'Mock last_name',
            description: '',
            biography: '',
            tags: [],
            pictureReferences: [],
            matches: {
                "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb": {
                    profileId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
                    name: "test",
                    description: "test",
                    biography: "test",
                    tags: ["test"],
                    pictureReferences: ["test"],
                    likes: [
                        {
                            likes: ["123-advertising"],
                            likedUser: "456"
                        }
                    ],
                    creationDate: new Date(0),
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    address: "test",
                    rent: 500,
                    permanent: false,
                    roomSize: 18,
                    numberOfBaths: 1,
                    roomMates: ["123-advertising"],
                    matches: [],
                    addressCoordinates: {
                        longitude: 12.34,
                        latitude: 56.78
                    }
                }
            },
            creationDate: "1970-01-01T00:00:00.000Z",
            onlineStatus: 'ONLINE',
            birthday: "1970-01-01T00:00:00.000Z",
            email: 'test@test.com',
            phoneNumber: '0795556677',
            gender: 'NOT SET',
            isSearchingRoom: true,
            isAdvertisingRoom: false,
            moveInDate: "1970-01-01T00:00:00.000Z",
            moveOutDate: "1970-01-01T00:00:00.000Z",
            flatId: '',
            isComplete: false,
            filters: {},
            likes: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"]
        };

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.getProfileByIdFromRepo("123")
            .then((response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);

            });
    });

    test('12 Test Invalid GetById Request', () => {
        // Setup Spies
        jest.spyOn(InvalidMockUserRepository.prototype, 'getProfileById');

        // Expected output
        const expected_response = "User Profile not found!"

        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.getProfileByIdFromRepo("123")
            .then((response) => {
                    console.log(response);
                    throw new Error("Expected Not-found-exception")
                })
            .catch((e) => {
                expect(e.message).toEqual(expected_response);
                expect(InvalidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
            })
    });

    test('13 Test Valid Get Request', () => {
        // Setup Spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfiles');

        // Expected output
        const expected_response = [{
                profileId: '123',
                firstName: 'Mock first_name',
                lastName: 'Mock last_name',
                description: '',
                biography: '',
                tags: [],
                pictureReferences: [],
                matches: {},
                creationDate: new Date(0),
                onlineStatus: 'ONLINE',
                birthday: new Date(0),
                email: 'test@test.com',
                phoneNumber: '0795556677',
                gender: 'NOT SET',
                isSearchingRoom: true,
                isAdvertisingRoom: false,
                moveInDate: new Date(0),
                moveOutDate: new Date(0),
                flatId: '',
                isComplete: false,
                filters: {},
                likes: []
            },
            {
                profileId: '456',
                firstName: 'Another mock first_name',
                lastName: 'Another mock last_name',
                description: '',
                biography: '',
                tags: [],
                pictureReferences: [],
                matches: {},
                creationDate: new Date(0),
                onlineStatus: 'ONLINE',
                birthday: new Date(0),
                email: 'test@test.com',
                phoneNumber: '0795556678',
                gender: 'NOT SET',
                isSearchingRoom: true,
                isAdvertisingRoom: false,
                moveInDate: new Date(0),
                moveOutDate: new Date(0),
                flatId: '',
                isComplete: false,
                filters: {},
                likes: []
            }];

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.getProfilesFromRepo()
            .then((response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.getProfiles).toBeCalledTimes(1);
            });
    });
});


describe("UserProfileDataService Like Profile Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('14 Test valid LikeUser Request', () => {
        // Setup Spies
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'updateProfile');
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');

        // Expected output
        const expected_response = {
            isMatch: true,
            updatedFlatProfile: {
                profileId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
                name: 'test',
                description: 'test',
                biography: 'test',
                tags: [ 'test' ],
                pictureReferences: [ 'test' ],
                likes: [
                    {
                        likes: ["123-advertising"],
                        likedUser: "456"
                    }
                ],
                creationDate: "1970-01-01T00:00:00.000Z",
                onlineStatus: undefined,
                moveInDate: "1970-01-01T00:00:00.000Z",
                moveOutDate: "1970-01-01T00:00:00.000Z",
                address: 'test',
                rent: 500,
                permanent: false,
                numberOfRoommates: undefined,
                roomSize: 18,
                numberOfBaths: 1,
                roomMates: ["123-advertising"],
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
                        likes: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"]
                    }
                },
                addressCoordinates: {
                    longitude: 12.34,
                    latitude: 56.78
                }
            }
        }

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.likeUser("123-advertising", "123")
            .then((response) => {
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(2);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(4);
                expect(ValidMockFlatRepository.prototype.updateProfile).toBeCalledTimes(1);
                expect(ValidMockFlatRepository.prototype.getProfileById).toBeCalledTimes(1);
            });
    });

    test('15 Test valid LikeFlat Request', () => {
        // Expected output
        const expected_response = {
            isMatch: true,
            updatedUserProfile: {
                profileId: '456',
                firstName: 'Mock first_name',
                lastName: 'Mock last_name',
                description: '',
                biography: '',
                tags: [],
                pictureReferences: [],
                matches: {
                    "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb": {
                        profileId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
                        name: "test",
                        description: "test",
                        biography: "test",
                        tags: ["test"],
                        pictureReferences: ["test"],
                        likes: [
                            {
                                likes: ["123-advertising"],
                                likedUser: "456"
                            }
                        ],
                        creationDate: new Date(0),
                        moveInDate: new Date(0),
                        moveOutDate: new Date(0),
                        address: "test",
                        rent: 500,
                        permanent: false,
                        roomSize: 18,
                        numberOfBaths: 1,
                        roomMates: ["123-advertising"],
                        matches: [],
                        addressCoordinates: {
                            longitude: 12.34,
                            latitude: 56.78
                        }
                    }
                },
                creationDate: "1970-01-01T00:00:00.000Z",
                onlineStatus: 'ONLINE',
                birthday: "1970-01-01T00:00:00.000Z",
                email: 'test456@test.com',
                phoneNumber: '0795556677',
                gender: 'NOT SET',
                isSearchingRoom: true,
                isAdvertisingRoom: false,
                moveInDate: "1970-01-01T00:00:00.000Z",
                moveOutDate: "1970-01-01T00:00:00.000Z",
                flatId: '',
                isComplete: false,
                filters: {},
                likes: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"]
            }
        }

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.likeFlat("456", "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb")
            .then((response) => {
                console.log(response)
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            });
    });

    test('16 Test valid dislike Request', () => {
        // Setup Spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');

        // Expected output
        const expected_response = "Successfully updated user 123"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.dislike("123", "456")
            .then((response) => {
                console.log(response)
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
            });
    });

});

describe("UserProfileDataService Devices Requests Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('16 Test valid Add Device Request', () => {
        // Setup Spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');

        // Expected output
        const expected_response = "Successfully added token to device push token list!"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

        return ds.addDevice("123", "new_expo")
            .then((response) => {
                console.log(response)
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
            });
    });

    test('16 Test Add Device Request - Token already exists', () => {
        // Setup Spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');

        // Expected output
        const expected_response = "Token exists in current push token list"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

        return ds.addDevice("123", "expo")
            .then((response) => {
                console.log(response)
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(0);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
            });
    });

    test('16 Test valid Delete Device Request', () => {
        // Setup Spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockUserRepository.prototype, 'updateProfile');

        // Expected output
        const expected_response = "Successfully deleted token from push token list"

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

        return ds.deleteDevice("123", "expo")
            .then((response) => {
                console.log(response)
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.updateProfile).toBeCalledTimes(1);
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
            });
    });

});

describe("UserProfileDataService Discover operations Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('17 Test Valid discover user - 1 profile requested', () => {
        // Prepare spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfiles');

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        //Inputs
        const uid = "123";
        const amount = 1

        //Expected Output
        const expected_response = [{
            profileId: "flt$00000000000000000",
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
            numberOfRoommates: 1,
            roomSize: 18,
            numberOfBaths: 1,
            roomMates: {
                "789-advertising": {
                    profileId: "456",
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
                    email: "test456@test.com",
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
            matches: {
                "123": {
                    profileId: '123',
                    firstName: 'Mock first_name',
                    lastName: 'Mock last_name',
                    description: '',
                    biography: '',
                    tags: [],
                    pictureReferences: [],
                    matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
                    creationDate: new Date(0),
                    onlineStatus: 'ONLINE',
                    birthday: new Date(0),
                    email: 'test@test.com',
                    phoneNumber: '0795556677',
                    gender: 'NOT SET',
                    isSearchingRoom: true,
                    isAdvertisingRoom: false,
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    flatId: '',
                    isComplete: false,
                    filters: {},
                    likes: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
                }
            },
            addressCoordinates: {
                longitude: 12.34,
                latitude: 56.78
            }
        }]

        return ds.discover(uid, amount).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(3);
                expect(ValidMockFlatRepository.prototype.getProfiles).toBeCalledTimes(1);
            });
    });

    test('18 Test Valid discover user - more profiles requested than available', () => {
        // Prepare spies
        jest.spyOn(ValidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfiles');

        // Used Instances
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        //Inputs
        const uid = "123-discover";
        const amount = 3

        //Expected Output
        const expected_response =[{
            profileId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
            name: 'test',
            description: 'test',
            biography: 'test',
            tags: [ 'test' ],
            pictureReferences: [ 'test' ],
            likes: [],
            creationDate: "1970-01-01T00:00:00.000Z",
            onlineStatus: undefined,
            moveInDate: "1970-01-01T00:00:00.000Z",
            moveOutDate: "1970-01-01T00:00:00.000Z",
            address: 'test',
            rent: 500,
            permanent: false,
            numberOfRoommates: 1,
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
                    flatId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
                    isComplete: false,
                    filters: {
                        age: {
                            min: 0,
                            max: 100
                        },
                        permanent: false,
                        matchingTimeRange: true
                    },
                    likes: []
                }
            },
            matches: {
                "123": {
                    profileId: '123',
                    firstName: 'Mock first_name',
                    lastName: 'Mock last_name',
                    description: '',
                    biography: '',
                    tags: [],
                    pictureReferences: [],
                    matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
                    creationDate: new Date(0),
                    onlineStatus: 'ONLINE',
                    birthday: new Date(0),
                    email: 'test@test.com',
                    phoneNumber: '0795556677',
                    gender: 'NOT SET',
                    isSearchingRoom: true,
                    isAdvertisingRoom: false,
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    flatId: '',
                    isComplete: false,
                    filters: {},
                    likes: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"]
                }
            },
            addressCoordinates: {
                longitude: 12.34,
                latitude: 56.78
            }
        },
        {
            profileId: "flt$00000000000000000",
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
            numberOfRoommates: 1,
            roomSize: 18,
            numberOfBaths: 1,
            roomMates: {
                "789-advertising": {
                    profileId: "456",
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
                    email: "test456@test.com",
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
            matches: {
                "123": {
                    profileId: '123',
                    firstName: 'Mock first_name',
                    lastName: 'Mock last_name',
                    description: '',
                    biography: '',
                    tags: [],
                    pictureReferences: [],
                    matches: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
                    creationDate: new Date(0),
                    onlineStatus: 'ONLINE',
                    birthday: new Date(0),
                    email: 'test@test.com',
                    phoneNumber: '0795556677',
                    gender: 'NOT SET',
                    isSearchingRoom: true,
                    isAdvertisingRoom: false,
                    moveInDate: new Date(0),
                    moveOutDate: new Date(0),
                    flatId: '',
                    isComplete: false,
                    filters: {},
                    likes: ["flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb"],
                }
            },
            addressCoordinates: {
                longitude: 12.34,
                    latitude: 56.78
            }
        }]

        return ds.discover(uid, amount).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
                expect(ValidMockUserRepository.prototype.getProfileById).toBeCalledTimes(5);
                expect(ValidMockFlatRepository.prototype.getProfiles).toBeCalledTimes(1);
            });
    });

    test('19 Test Invalid discover user - profile not found', () => {
        // Prepare spies
        jest.spyOn(InvalidMockUserRepository.prototype, 'getProfileById');
        jest.spyOn(ValidMockFlatRepository.prototype, 'getProfiles');

        // Used Instances
        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        //Inputs
        const uid = "12345";
        const amount = 3

        // Expected Output
        const expected_error_msg = "User Profile with id 12345 not found"


        return ds.discover(uid, amount)
            .then((response) => {
                console.log(response);
                throw new TypeError("Expected a profile not found error");
            })
            .catch(
                (error) => {
                    expect(error.message).toEqual(expected_error_msg);
                    expect(InvalidMockUserRepository.prototype.getProfileById).toBeCalledTimes(1);
                    expect(ValidMockFlatRepository.prototype.getProfiles).toBeCalledTimes(0);
                }
            );
    });
});
