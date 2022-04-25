import {ProfileDataService} from "../main/data-services/ProfileDataService";
import {InvalidMockUserRepository, ValidMockUserRepository} from "../main/repository/MockUserRepository";
import {InvalidMockFlatRepository, ValidMockFlatRepository} from "../main/repository/MockFlatRepository";


// Unit Tests

describe("ProfileDataService Test", () => {

    // GetById Tests

    test('1 Test Valid GetById Request', () => {
        const expected_response = {
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
        };
        const ds = new ProfileDataService(new ValidMockUserRepository(), new ValidMockFlatRepository());

        return ds.getProfileByIdFromRepo("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response));
            }
        );
    });

    test('2 Test Invalid GetById Request', () => {
        const expected_response = "Profile not found!"
        const ds = new ProfileDataService(new InvalidMockUserRepository(), new InvalidMockFlatRepository());

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
});
