import {UserProfileConverter} from "../converters/UserProfileConverter";

describe('ValidatorReport test', () => {
    let json_body = {
        "password": "test12",
        "firstName": "test",
        "lastName": "test",
        "description": "test",
        "biography": "test",
        "tags": "test",
        "pictureReference": "test",
        "birthday": "1999-06-22",
        "emailAddress": "test@test.ch",
        "phoneNumber": "+41795233087",
        "gender": "MALE",
        "isSearchingRoom": "true",
        "isAdvertisingRoom": "false",
        "moveInDate": "1999-06-22",
        "moveOutDate": "1999-06-22"
    };

    test('report should match the errormessage', () => {
        let res = UserProfileConverter.convertPostDto(json_body);
        // TODO: expect res to match predefined object
        expect(res).toBeDefined();
    })
})