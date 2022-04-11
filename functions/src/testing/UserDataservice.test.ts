import {UserProfileDataService} from "../data-services/UserProfileDataService";
import {InvalidMockUserRepository, ValidMockUserRepository} from "../repository/MockUserRepository";


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

            // Value for third test
            .mockRejectedValueOnce(Promise.reject(new Error("Firebase: Error (auth/email-already-in-use).")))
            // Value for further tests
            .mockReturnValue(Promise.resolve(userCredentialMock)),
        deleteUser: jest.fn()
            // Default Value
            .mockReturnValue(Promise.resolve("Successfully deleted user"))
    }
});

jest.mock('../repository/UserRepository', () => {
    return {
        UserRepository: jest.fn()
            // Value for first test
            .mockImplementationOnce(() => new ValidMockUserRepository())
            // Value for second test
            .mockImplementationOnce(() => new ValidMockUserRepository())
            // Value for third test
            .mockImplementationOnce(() => new ValidMockUserRepository())
            // Value for fourth test
            .mockImplementationOnce(() => new InvalidMockUserRepository())
            // Value for further tests
            .mockImplementation(() => new ValidMockUserRepository())
    }
});

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
            password: "1234567"
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

describe("User Profile Test", () => {

    test('Test Valid Add UserProfile Request', () => {
        const expected_response = {
            profileId: "123",
            firstName: "test",
            lastName: "test",
            description: "",
            biography: "",
            tags: [],
            pictureReference: "",
            matches: [],
            viewed: [],
            likes: [],
            creationDate: new Date(StubInputs.getCurrentDateStr()),
            onlineStatus: "ONLINE",
            birthday: "1999-06-22",
            email: "test@test.ch",
            phoneNumber: "0795553030",
            gender: "NOT SET",
            isSearchingRoom: true,
            isAdvertisingRoom: false,
            moveInDate: new Date(NaN),
            moveOutDate: new Date(NaN)
        }

        return UserProfileDataService.addUserProfile(StubInputs.getValidUserPostBody()).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response))
            }
        );
    });

    test('Test Validator Error Add UserProfile Request', () => {
        // This test should only examine the correct returning of an error message in case of a validation error
        // -> This is why only a single invalid input is tested
        // -> To examine the correct behaviour of the validator there exists a separate test file

        const expected_response = "Errors:\ninvalid EmailAddress"
        let invalid_input = StubInputs.getValidUserPostBody();
        invalid_input.email = "invalid_email"

        return UserProfileDataService.addUserProfile(invalid_input)
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a validation error")
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(new Error(expected_response))
                }
            )
    });

    test('Test UserAlreadyExists Error Add UserProfile Request', () => {
        const expected_response = "Firebase: Error (auth/email-already-in-use)."

        return UserProfileDataService.addUserProfile(StubInputs.getValidUserPostBody())
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a userAlreadyExists error")
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(Promise.reject(new Error(expected_response)));
                }
            )
    });

    it('Test Cannot access Repo Add UserProfile Request', async () =>  {
        const expected_response = "Error: Error: Could not post user due to: Could not add User"

        return UserProfileDataService.addUserProfile(StubInputs.getValidUserPostBody())
            .then(
                (response) => {
                    console.log(response);
                    throw new TypeError("Expected a repo error")
                }
            )
            .catch(
                (error) => {
                    expect(error).toEqual(new Error(expected_response))
                }
            )
    });


});

