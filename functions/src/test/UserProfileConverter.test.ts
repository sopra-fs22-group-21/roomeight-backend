import {UserProfileConverter} from "../converters/UserProfileConverter";

function generatePW(length: number): string {
    let pw = "";
    for ( let i = 0; i < length; i++ ) {
        pw += "1"
    }
    return pw;
}

describe('ValidatorReport test', () => {
    let json_body = {
        "password": generatePW(6),
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
