import {ReferenceController} from "../main/ReferenceHandling/ReferenceController";
import {InvalidMockUserRepository, ValidMockUserRepository} from "../main/repository/MockUserRepository";

// Unit Tests

describe("ReferenceController Test", () => {

    // List Resolving Tests

    test('1 Test Resolving of Reference List containing single element', () => {
        const expected_answer = {
            "": {
                profileId: '',
                firstName: 'Mock first_name',
                lastName: 'Mock last_name',
                description: '',
                biography: '',
                tags: [],
                pictureReferences: [],
                matches: [],
                creationDate: "1970-01-01T00:00:00.000Z",
                onlineStatus: 'ONLINE',
                birthday: "1970-01-01T00:00:00.000Z",
                email: 'test@test.com',
                phoneNumber: '0795556677',
                gender: 'NOT SET',
                isSearchingRoom: false,
                isAdvertisingRoom: false,
                moveInDate: "1970-01-01T00:00:00.000Z",
                moveOutDate:  "1970-01-01T00:00:00.000Z",
                flatId: ''
            }
        }
        const reference_list = ["123"]
        const mock_user_repo = new ValidMockUserRepository();
        const resolver = new ReferenceController(mock_user_repo);

        return resolver.resolveProfileReferenceList(reference_list).then((response) => {
            console.log(response);
            expect(JSON.stringify(response.result)).toEqual(JSON.stringify(expected_answer));
            expect(JSON.stringify(response.unresolvedReferences)).toEqual("[]");
        })
    });

    test('2 Test Resolving of Reference List containing single element -> element not found', () => {
        const reference_list = ["123"]
        const mock_user_repo = new InvalidMockUserRepository();
        const resolver = new ReferenceController(mock_user_repo);

        return resolver.resolveProfileReferenceList(reference_list).then((response) => {
            console.log(response);
            expect(JSON.stringify(response.result)).toEqual("{}");
            expect(JSON.stringify(response.unresolvedReferences)).toEqual("[\"123\"]");
        })
    });

    // Reference Clean Up Tests

    test('3 Test Clean Up outdated References', () => {
        const mock_user_repo = new ValidMockUserRepository();
        const resolver = new ReferenceController(mock_user_repo);

        return resolver.cleanUpReferencesList("123", "matches", ["456", "789"], ["789"])
            .then(
                (r) => {
                    expect(r).toEqual("Successfully removed outdated references");
                }
        )
    });

    test('4 Test Clean Up outdated References -> Update not possible', () => {
        const mock_user_repo = new InvalidMockUserRepository();
        const resolver = new ReferenceController(mock_user_repo);

        return resolver.cleanUpReferencesList("123", "matches", ["456", "789"], ["789"])
            .then(
                (r) => {
                    expect(r).toEqual("Could not update References of profile 123 due to: Could not update User");
                }
            )
    });

    // Resolve Single Reference
    test('5 Test Resolving of Single Reference', () => {
        const expected_answer = {
            "": {
                profileId: '',
                firstName: 'Mock first_name',
                lastName: 'Mock last_name',
                description: '',
                biography: '',
                tags: [],
                pictureReferences: [],
                matches: [],
                creationDate: "1970-01-01T00:00:00.000Z",
                onlineStatus: 'ONLINE',
                birthday: "1970-01-01T00:00:00.000Z",
                email: 'test@test.com',
                phoneNumber: '0795556677',
                gender: 'NOT SET',
                isSearchingRoom: false,
                isAdvertisingRoom: false,
                moveInDate: "1970-01-01T00:00:00.000Z",
                moveOutDate:  "1970-01-01T00:00:00.000Z",
                flatId: ''
            }
        }
        const mock_user_repo = new ValidMockUserRepository();
        const resolver = new ReferenceController(mock_user_repo);

        return resolver.resolveSingleProfileReference("123").then((response) => {
            console.log(response);
            expect(JSON.stringify(response.result)).toEqual(JSON.stringify(expected_answer));
            expect(JSON.stringify(response.unresolvedReferences)).toEqual("[]");
        })
    });

    test('6 Test Resolving of single Reference -> element not found', () => {
        const reference_list = ["123"]
        const mock_user_repo = new InvalidMockUserRepository();
        const resolver = new ReferenceController(mock_user_repo);

        return resolver.resolveProfileReferenceList(reference_list).then((response) => {
            console.log(response);
            expect(JSON.stringify(response.result)).toEqual("{}");
            expect(JSON.stringify(response.unresolvedReferences)).toEqual("[\"123\"]");
        })
    });

});
