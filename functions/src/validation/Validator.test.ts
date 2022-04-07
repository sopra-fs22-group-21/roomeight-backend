import { Validator } from './Validator'

describe('Validator test', () => {

     let validTestData = {
        "Password": "test12",
        "FirstName": "test",
        "LastName": "test",
        "Description": "test",
        "Biography": "test",
        "Tags": "test",
        "PictureReference": "test",
        "Birthday": "2019-06-22",
        "EmailAddress": "test@test.ch",
        "PhoneNumber": "+41795233087",
        "Gender": "MALE",
        "IsSearchingRoom": "true",
        "IsAdvertisingRoom": "false",
        "MoveInDate": "1999-06-22",
        "MoveOutDate": "1999-06-22"
      }
    test('should succeeded with valid input', () => {
        let res = Validator.validatePostUser(validTestData);
        expect(res.validationFoundErrors()).toBe(false);
    })
})