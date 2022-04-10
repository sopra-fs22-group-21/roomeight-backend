import { Validator } from '../validation/Validator'

describe('Validator test', () => {

     let validTestData = {
        "password": "test12",
        "firstName": "test",
        "lastName": "test",
        "description": "test",
        "biography": "test",
        "tags": "test",
        "pictureReference": "test",
        "birthday": "2019-06-22",
        "email": "test@test.ch",
        "phoneNumber": "+41795233087",
        "gender": "MALE",
        "isSearchingRoom": "true",
        "isAdvertisingRoom": "false",
        "moveInDate": "1999-06-22",
        "moveOutDate": "1999-06-22"
      }
    test('should succeeded with valid input', () => {
        let res = Validator.validatePostUser(validTestData);
        console.log(res.toString());
        expect(res.validationFoundErrors()).toBe(false);
    })
})
