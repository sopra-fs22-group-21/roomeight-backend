import {UserRepository} from "../main/repository/UserRepository";
import {UserProfile} from "../main/data-model/UserProfile";
import {Status} from "../main/data-model/Status";
import {Gender} from "../main/data-model/Gender";
import {config} from "../../firebase_config";

// Declaring Mocks

jest.mock('firebase/firestore', () => {
    return {
        getFirestore: jest.fn(),

        setDoc: jest.fn()
            .mockReturnValue(Promise.resolve("Added User")),
        updateDoc: jest.fn()
            .mockReturnValue(Promise.resolve("Updated User")),
        deleteDoc: jest.fn()
            .mockReturnValue(Promise.resolve("Deleted User")),
        doc: jest.fn()
            .mockReturnValue(Promise.resolve("123")),
    }
});

// Unit Tests

describe("UserProfileRepository Test", () => {

    // Declare user repo and app
    let user_repo: UserRepository;
    const admin = require('firebase-admin');
    const app = admin.initializeApp(config);

    beforeEach(() => {
       user_repo = new UserRepository(app);
    })

    test('1 Test Valid Add UserProfile Request', () => {
        const input = new UserProfile("", "", "", "", [],
            "", [], new Date(0), Status.online, new Date(NaN),
            new Date(NaN), new Date(0), "", "",
            Gender.notSet, true, false, [], "", [],
            "")

        const expected_response = "Added User"

        return user_repo.addUserProfile(input).then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response))
            }
        );
    });

    test('2 Test Valid Update UserProfile Request', () => {
        const input = {
            name: "updatedName"
        }

        const expected_response = "Successfully updated User with id: 123"

        return user_repo.updateUserProfile(input, "123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response))
            }
        );
    });

    test('3 Test Valid Delete UserProfile Request', () => {
        const expected_response = "Successfully deleted User with id: 123"

        return user_repo.deleteUserProfile("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response))
            }
        );
    });


})
