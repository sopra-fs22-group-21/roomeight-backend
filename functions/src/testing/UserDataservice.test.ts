import {UserProfileDataService} from "../data-services/UserProfileDataService";
import {UserRepository} from "../repository/UserRepository";
import {UserProfile} from "../data-model/UserProfile";


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
        createUserWithEmailAndPassword: jest.fn(() => {
            console.log("Entered Mock createUserWithEmailAndPassword")
            return Promise.resolve(userCredentialMock);
        })
    }
});

jest.mock('../repository/UserRepository', () => {
    return {
        UserRepository: jest.fn().mockImplementation(() => {
            console.log(new MockUserRepository())
            return new MockUserRepository();
        })
    }
});

// Mock Repository for db calls

class MockUserRepository implements UserRepository{
    constructor() {
        this.collection_name = "";
        this.database = null;
    }

    collection_name: string;
    database: any;

    addUserProfile(user_to_add: UserProfile): Promise<string> {
        console.log("Entered Mock addUserProfile");
        return Promise.resolve("Successfully added " + user_to_add.email);
    }

    deleteUserProfile(profileId: string): Promise<string> {
        console.log("Entered Mock deleteUserProfile");
        return Promise.resolve("Successfully deleted user  " + profileId);
    }

    updateUserProfile(update_fields: any, profile_id: string): Promise<string> {
        console.log("Entered Mock updateUserProfile");
        return Promise.resolve("Successfully updated user  " + profile_id);
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
        // Define specific mock for error throwing
        jest.mock('firebase/auth', () => {
            throw new Error("Firebase: Error (auth/email-already-in-use).")
        });

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
                    expect(error).toEqual(new Error(expected_response))
                }
            )
    });

});

