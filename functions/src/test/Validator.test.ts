import { UserValidator } from '../main/validation/UserValidator'

function generatePW(length: number): string {
  let pw = "";
  for ( let i = 0; i < length; i++ ) {
      pw += "1"
  }
  return pw;
}


describe('Validate PostUser', () => {

  let validAllFields = {
    "password": generatePW(6),
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
    "isSearchingRoom": true,
    "isAdvertisingRoom": false,
    "moveInDate": "1999-06-22",
    "moveOutDate": "1999-06-22"
  }

  let invalidFields = {
    "password":  generatePW(1),
    "firstName": "",
    "lastName": "",
    "birthday": "asdf",
    "email": "testtest",
    "phoneNumber": "000417952330",
    "isSearchingRoom": "tru",
    "isAdvertisingRoom": "fals",
    "moveInDate": "2212019",
    "moveOutDate": "2212019"
  }

  let validMandatory = {
    "password": generatePW(6),
    "firstName": "test",
    "lastName": "test",
    "birthday": "2019-06-22",
    "email": "test@test.ch",
    "phoneNumber": "+41795233087"
  }

  let missingMandatory = {
    "password": generatePW(6),
    "firstName": "test",
    "birthday": "2019-06-22",
    "email": "test@test.ch"
  }

  let unexpectedField = {
    "password": generatePW(6),
    "firstName": "test",
    "lastName": "test",
    "birthday": "2019-06-22",
    "email": "test@test.ch",
    "phoneNumber": "+41795233087",
    "hometown": "zuerich"
  }

  let invalidDateRange = {
    "password": generatePW(6),
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
    "isSearchingRoom": true,
    "isAdvertisingRoom": false,
    "moveInDate": "1999-06-23",
    "moveOutDate": "1999-06-22"
  }

  let containingNull = {
    "password": generatePW(6),
    "firstName": null,
    "lastName": "test",
    "birthday": "2019-06-22",
    "email": "test@test.ch",
    "phoneNumber": "+41795233087"
  }

  test('test valid input for all fields', () => {
    let res = UserValidator.validatePostUser(validAllFields);
    expect(res.validationFoundErrors()).toBe(false);
  })

  test('test valid input for mandatory fields', () => {
    let res = UserValidator.validatePostUser(validMandatory);
    expect(res.validationFoundErrors()).toBe(false);
  })

  test('test invalid input fields', () => {
    let res = UserValidator.validatePostUser(invalidFields);
    expect(res.validationFoundErrors()).toBe(true);
  })

  test('test invalid input with missing fields', () => {
    let res = UserValidator.validatePostUser(missingMandatory);
    let expected = "Errors:\nJSON object does not contain required field: lastName,\nJSON object does not contain required field: phoneNumber\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReference,gender,isSearchingRoom,isAdvertisingRoom,moveInDate,moveOutDate"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })

  test('test invalid input with unexpected fields', () => {
    let res = UserValidator.validatePostUser(unexpectedField);
    let expected = "Errors:\nUnknown Field: hometown\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReference,gender,isSearchingRoom,isAdvertisingRoom,moveInDate,moveOutDate"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })

  test('test invalid date range', () => {
    let res = UserValidator.validatePostUser(invalidDateRange);
    let expected = "Errors:\nmoveInDate must be before moveOutDate\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReference,gender,isSearchingRoom,isAdvertisingRoom,moveInDate,moveOutDate"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })

  test('test json with null value', () => {
    let res = UserValidator.validatePostUser(containingNull);
    let expected = "Errors:\nfirstName is null\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReference,gender,isSearchingRoom,isAdvertisingRoom,moveInDate,moveOutDate"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })
})


describe('Validate PatchUser', () => {

  let validAllFields = {
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
    "isSearchingRoom": true,
    "isAdvertisingRoom": false,
    "moveInDate": "1999-06-22",
    "moveOutDate": "1999-06-22",
    "flatId": "18-921-981"
  }

  let invalidFields = {
    "password": "",
    "firstName": "",
    "lastName": "",
    "birthday": "asdf",
    "email": "testtest",
    "phoneNumber": "000417952330",
    "isSearchingRoom": "tru",
    "isAdvertisingRoom": "fals",
    "moveInDate": "2212019",
    "moveOutDate": "2212019"
  }

  let unexpectedField = {
    "password": generatePW(6),
    "firstName": "test",
    "lastName": "test",
    "birthday": "2019-06-22",
    "email": "test@test.ch",
    "phoneNumber": "+41795233087"
  }

  test('test valid input for all fields', () => {
    let res = UserValidator.validatePatchUser(validAllFields);
    expect(res.validationFoundErrors()).toBe(false);
  })

  test('test invalid input fields', () => {
    let res = UserValidator.validatePatchUser(invalidFields);
    expect(res.validationFoundErrors()).toBe(true);
  })

  test('test invalid input with unexpected fields', () => {
    let res = UserValidator.validatePatchUser(unexpectedField);
    let expected = "Errors:\nUnknown Field: password\n" +
        "Mandatory fields are: \n" +
        "Optional fields are: description,biography,tags,pictureReference,gender,isSearchingRoom,isAdvertisingRoom,moveInDate,moveOutDate,firstName,lastName,birthday,phoneNumber,email,flatId"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })
})

