import {ReferenceController} from "../main/ReferenceHandling/ReferenceController";
import {ValidMockUserRepository} from "../main/repository/MockUserRepository";

// Unit Tests

describe("ReferenceController Test", () => {

    // List Resolving Tests

    test('1 Test Resolving of Reference List containing single element', () => {
        const expected_answer = new Array({
            profileId: '',
            firstName: 'Mock first_name',
            lastName: 'Mock last_name',
            description: '',
            biography: '',
            tags: [],
            pictureReference: '',
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
        });
        const reference_list = ["123"]
        const mock_user_repo = new ValidMockUserRepository();
        const resolver = new ReferenceController(mock_user_repo);

        return resolver.resolveProfileReferenceList(reference_list).then((response) => {
            console.log(response);
            expect(JSON.stringify(response.result)).toEqual(JSON.stringify(expected_answer));
            expect(JSON.stringify(response.unresolvedReferences)).toEqual("[]");
        })
    });
});
