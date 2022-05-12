import {UserProfileDataService} from "../main/data-services/UserProfileDataService";
import {InvalidMockUserRepository, ValidMockUserRepository} from "../main/repository/MockUserRepository";
import {InvalidMockFlatRepository, ValidMockFlatRepository} from "../main/repository/MockFlatRepository";


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
            // Value for fifth tests
                //Not needed for fifth test
            // Value for sixth tests
                //Not needed for sixth test
            // Value for seventh tests
                //Not needed for seventh test
            // Value for eighth tests
                //Not needed for eighth test
            // Value for ninth tests
                //Not needed for ninth test
            // Value for ninth tests
                //Not needed for tenth test
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

describe("UserProfileDataService Test", () => {

    // Post User Profile Tests

    test('1 Test Valid Add UserProfile Request', () => {
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
            filters: {matchingTimeRange: true}
        }

        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn());

        return ds.addUserProfile(StubInputs.getValidUserPostBody()).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('2 Test Validator Error Add UserProfile Request', () => {
        // This test should only examine the correct returning of an error message in case of a validation error
        // -> This is why only a single invalid input is tested
        // -> To examine the correct behaviour of the validator there exists a separate test file

        const expected_response = "Errors:\nInvalid email\n" +
            "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
            "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,isComplete"
        let invalid_input = StubInputs.getValidUserPostBody();
        invalid_input.email = "invalid_email"

        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

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
                }
            )
    });

    test('3 Test UserAlreadyExists Error Add UserProfile Request', () => {
        const expected_response = "Firebase: Error (auth/email-already-in-use)."

        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

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
                }
            )
    });

    jest.clearAllMocks();

    test('4 Test Cannot access Repo Add UserProfile Request', async () =>  {
        const expected_response = "Could not post user due to: Could not post User"

        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

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
                }
            )
    });

    // Patch Tests

    test('5 Test Valid Patch  UserProfile Request', () => {
        const expected_response = {
            profileId: "123",
            firstName: 'Mock first_name',
            lastName: 'Mock last_name',
            description: '',
            biography: '',
            tags: [],
            pictureReferences: [],
            matches: {},
            creationDate:  new Date(0),
            onlineStatus: 'ONLINE',
            birthday:  new Date(0),
            email: 'test@test.com',
            phoneNumber: '0795556677',
            gender: 'NOT SET',
            isSearchingRoom: true,
            isAdvertisingRoom: false,
            moveInDate: new Date(0),
            moveOutDate:  new Date(0),
            flatId: '',
            filters: {}
        }

        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

        return ds.updateUser(StubInputs.getValidUpdateBody(), "123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('6 Test Validator Error Patch UserProfile Request', () => {
        // This test should only examine the correct returning of an error message in case of a validation error
        // -> This is why only a single invalid input is tested
        // -> To examine the correct behaviour of the validator there exists a separate test file

        const expected_response = "Errors:\nInvalid phoneNumber\n" +
            "Mandatory fields are: \n" +
            "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate," +
                                 "firstName,lastName,birthday,phoneNumber,email,flatId,isComplete,filters"
        let invalid_input = StubInputs.getValidUpdateBody();
        invalid_input.phoneNumber = "0"

        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

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
                }
            )
    });

    test('7 Test Cannot access Repo Patch UserProfile Request', async () =>  {
        const expected_response = "Could not update User"

        const user_repo = new InvalidMockUserRepository();
        const flat_repo = new InvalidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

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
                }
            )
    });

    // Delete Tests

    test('8 Test Valid Delete UserProfile Request', () => {
        const expected_response = "Successfully deleted user 123"

        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

        return ds.deleteUser("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('9 Test Cannot access Auth Delete UserProfile Request', async () =>  {
        const expected_response = "Could not delete auth User"
        const user_repo = new ValidMockUserRepository();
        const flat_repo = new ValidMockFlatRepository();
        const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())

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
                }
            )
    });

    // test('10 Test Cannot access Repo Delete UserProfile Request', async () =>  {
    //     const expected_response = "Error: User was deleted from auth but not from firestore: Could not delete User"
    //
    //     const user_repo = new InvalidMockUserRepository();
    //     const flat_repo = new InvalidMockFlatRepository();
    //     const ds = new UserProfileDataService(user_repo, flat_repo, jest.fn())
    //
    //     return ds.deleteUser("123")
    //         .then(
    //             (response) => {
    //                 console.log(response);
    //                 throw new TypeError("Expected a repo error");
    //             }
    //         )
    //         .catch(
    //             (error) => {
    //                 expect(error).toEqual(new Error(expected_response));
    //             }
    //         )
    // });

    // GetById Tests

    test('11 Test Valid GetById Request', () => {
        const expected_response = {
            profileId: '123',
            firstName: 'Mock first_name',
            lastName: 'Mock last_name',
            description: '',
            biography: '',
            tags: [],
            pictureReferences: [],
            matches: {},
            creationDate: "1970-01-01T00:00:00.000Z",
            onlineStatus: 'ONLINE',
            birthday: "1970-01-01T00:00:00.000Z",
            email: 'test@test.com',
            phoneNumber: '0795556677',
            gender: 'NOT SET',
            isSearchingRoom: true,
            isAdvertisingRoom: false,
            moveInDate: "1970-01-01T00:00:00.000Z",
            moveOutDate:  "1970-01-01T00:00:00.000Z",
            flatId: '',
            filters: {}
        };
        const ds = new UserProfileDataService(new ValidMockUserRepository(), new ValidMockFlatRepository(), jest.fn());

        return ds.getProfileByIdFromRepo("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('12 Test Invalid GetById Request', () => {
        const expected_response = "User Profile not found!"
        const ds = new UserProfileDataService(new InvalidMockUserRepository(), new InvalidMockFlatRepository(), jest.fn());

        return ds.getProfileByIdFromRepo("123")
            .then(
                (response) => {
                    console.log(response);
                    throw new Error("Expected Not found exception")
                })
            .catch((e) => {
                expect(e.message).toEqual(expected_response);
            })
    });

    test('13 Test valid LikeUser Request', () => {
        const ds = new UserProfileDataService(new ValidMockUserRepository(), new ValidMockFlatRepository(), jest.fn());
        const expected_response = {
            isMatch: false,
            updatedFlatProfile: {
                profileId: undefined,
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
                numberOfRoommates: undefined,
                roomSize: 18,
                numberOfBaths: 1,
                roomMates: [],
                matches: {},
                addressCoordinates: {
                    longitude: 12.34,
                    latitude: 56.78
                }
        }
    }

        return ds.likeUser("123-advertising", "456")
            .then((response) => {
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            });
    });

    test('14 Test valid LikeFlat Request', () => {
        const ds = new UserProfileDataService(new ValidMockUserRepository(), new ValidMockFlatRepository(), jest.fn());
        const expected_response = {
            isMatch: false,
            updatedUserProfile: {
                profileId: '123',
                firstName: 'Mock first_name',
                lastName: 'Mock last_name',
                description: '',
                biography: '',
                tags: [],
                pictureReferences: [],
                matches: {},
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
                isComplete: undefined,
                filters: {}
        }
    }

        return ds.likeFlat("123", "456")
            .then((response) => {
                console.log(response)
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            });
    });

});
