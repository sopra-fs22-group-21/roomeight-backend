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
    "tags": ["COOKING"],
    "pictureReferences": ["test"],
    "birthday": "2019-06-22",
    "email": "test@test.ch",
    "phoneNumber": "+41795233087",
    "gender": "MALE",
    "moveInDate": "1999-06-22",
    "moveOutDate": "1999-06-22",
    "isComplete" : true
  }

  let invalidFields = {
    "password":  generatePW(1),
    "firstName": "",
    "lastName": "",
    "birthday": "asdf",
    "email": "testtest",
    "phoneNumber": "000417952330",
    "moveInDate": "2212019",
    "moveOutDate": "2212019",
    "isComplete": "asdf"
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
    "pictureReferences": ["test"],
    "birthday": "2019-06-22",
    "email": "test@test.ch",
    "phoneNumber": "+41795233087",
    "gender": "MALE",
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

  test('1 Test valid input for all fields', () => {
    let res = UserValidator.validatePostUser(validAllFields);
    console.log(res.toString())
    expect(res.validationFoundErrors()).toBe(false);
  });

  test('2 Test valid input for mandatory fields', () => {
    let res = UserValidator.validatePostUser(validMandatory);
    expect(res.validationFoundErrors()).toBe(false);
  });

  test('3 Test invalid input fields', () => {
    let res = UserValidator.validatePostUser(invalidFields);
    expect(res.validationFoundErrors()).toBe(true);
  });

  test('4 Test invalid input with missing fields', () => {
    let res = UserValidator.validatePostUser(missingMandatory);
    let expected = "Errors:\nJSON object does not contain required field: lastName,\nJSON object does not contain required field: phoneNumber\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,isComplete"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  });

  test('5 Test invalid input with unexpected fields', () => {
    let res = UserValidator.validatePostUser(unexpectedField);
    let expected = "Errors:\nUnknown Field: hometown\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,isComplete"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  });

  test('6 Test invalid date range', () => {
    let res = UserValidator.validatePostUser(invalidDateRange);
    let expected = "Errors:\nInvalid tags: Should be a string array,\n" +
        "Invalid moveOutDate: moveInDate must be before moveOutDate\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,isComplete"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  });

  test('7 Test json with null value', () => {
    let res = UserValidator.validatePostUser(containingNull);
    let expected = "Errors:\nfirstName is null\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,isComplete"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  });

  test('8 Test invalid input birthday today', () => {
    let input = validAllFields;
    input.birthday = new Date().toString();
    let res = UserValidator.validatePostUser(input);
    let expected = "Errors:\nInvalid birthday: selected date is after today\n" +
        "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,isComplete"
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
    "tags": ["COOKING"],
    "pictureReferences": ["test"],
    "birthday": "2019-06-22",
    "email": "test@test.ch",
    "phoneNumber": "+41795233087",
    "gender": "MALE",
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

  test('9 Test valid input for all fields', () => {
    let res = UserValidator.validatePatchUser(validAllFields);
    expect(res.validationFoundErrors()).toBe(false);
  });

  test('19 Test invalid input fields', () => {
    let res = UserValidator.validatePatchUser(invalidFields);
    let expected = "Errors:\nUnknown Field: password,\n" +
        "Invalid firstName,\n" +
        "Invalid lastName,\n" +
        "Invalid birthday, Expected Format: 1999-06-22,\n" +
        "Invalid email,\n" +
        "Invalid moveInDate: Expected Format: 1999-06-22,\n" +
        "Invalid moveOutDate: Expected Format: 1999-06-22\n" +
        "Mandatory fields are: \n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,firstName," +
        "lastName,birthday,phoneNumber,email,flatId,isComplete,filters"
    expect(res.toString()).toEqual(expected);
    expect(res.validationFoundErrors()).toBe(true);
  });

  test('11 Test invalid input with unexpected fields', () => {
    let res = UserValidator.validatePatchUser(unexpectedField);
    let expected = "Errors:\nUnknown Field: password\n" +
        "Mandatory fields are: \n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,firstName," +
                             "lastName,birthday,phoneNumber,email,flatId,isComplete,filters"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })
})

