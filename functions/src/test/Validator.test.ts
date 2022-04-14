import { Validator } from '../main/validation/Validator'

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
    "isSearchingRoom": "true",
    "isAdvertisingRoom": "false",
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
    "isSearchingRoom": "true",
    "isAdvertisingRoom": "false",
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
    let res = Validator.validatePostUser(validAllFields);
    expect(res.validationFoundErrors()).toBe(false);
  })

  test('test valid input for mandatory fields', () => {
    let res = Validator.validatePostUser(validMandatory);
    expect(res.validationFoundErrors()).toBe(false);
  })

  test('test invalid input fields', () => {
    let res = Validator.validatePostUser(invalidFields);
    expect(res.validationFoundErrors()).toBe(true);
  })

  test('test invalid input with missing fields', () => {
    let res = Validator.validatePostUser(missingMandatory);
    let expected = "Errors:\nJSON object does not contain required field: lastName, \nJSON object does not contain required field: phoneNumber"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })

  test('test invalid input with unexpected fields', () => {
    let res = Validator.validatePostUser(unexpectedField);
    let expected = "Errors:\nUnknown Field: hometown"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })

  test('test invalid date range', () => {
    let res = Validator.validatePostUser(invalidDateRange);
    let expected = "Errors:\nmoveInDate must be before moveOutDate"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })

  test('test json with null value', () => {
    let res = Validator.validatePostUser(containingNull);
    let expected = "Errors:\nfirstName is null"
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
    "isSearchingRoom": "true",
    "isAdvertisingRoom": "false",
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
    let res = Validator.validatePatchUser(validAllFields);
    expect(res.validationFoundErrors()).toBe(false);
  })

  test('test invalid input fields', () => {
    let res = Validator.validatePatchUser(invalidFields);
    expect(res.validationFoundErrors()).toBe(true);
  })

  test('test invalid input with unexpected fields', () => {
    let res = Validator.validatePatchUser(unexpectedField);
    let expected = "Errors:\nUnknown Field: password"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })
})

