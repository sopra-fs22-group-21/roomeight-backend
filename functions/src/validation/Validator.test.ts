import { Validator } from './Validator'

describe('Validator test', () => {

     let testData = {
        "Password": "test12",
        "FirstName": "test",
        "LastName": "test",
        "Description": "test",
        "Biography": "test",
        "Tags": "test",
        "PictureReference": "test",
        "Matches": "test",
        "Mismatches": "test",
        "Birthday": "1999-06-22",
        "EmailAddress": "test@test.ch",
        "PhoneNumber": "+41795233087",
        "Gender": "MALE",
        "IsSearchingRoom": "true",
        "IsAdvertisingRoom": "false",
        "MoveInDate": "1999-06-22",
        "MoveOutDate": "1999-06-22"
      }
    test('shoul succeeded with valid input', () => {
        let res = Validator.validateUser(testData);
        expect(res.hasErrors).toBe(false);
    })
})