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

  let invalidAllFields = {
    "password": "1",
    "firstName": true,
    "lastName": false,
    "description": 15,
    "biography": -3,
    "tags": ["BASKET"],
    "pictureReferences": [12],
    "birthday": "12-00-00",
    "email": "email",
    "phoneNumber": "1111",
    "gender": "TEST",
    "moveInDate": "15",
    "moveOutDate": "13",
    "isComplete" : "false"
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

  test('9 Test invalid input for all fields', () => {
    let input = invalidAllFields;
    let res = UserValidator.validatePostUser(input);
    let expected = "Errors:\nInvalid password: Should be of type string and have between 5 and 50 characters,\n" +
        "Invalid firstName,\n" +
        "Invalid lastName,\n" +
        "Invalid description: Should be of type string and have less than 300 signs,\n" +
        "Invalid biography: Should be of type string and have less than 300 signs,\n" +
        "Invalid tag: BASKET is not a valid tag. Valid tags are: COOKING,SPORTS,INSTRUMENTS,CLEANLINESS,STUDENT,WORKING,PETS,PARTY,COFFEE,WINE,WOKO,JUWO,PEACEFUL,SMOKER,\n" +
        "invalid pictureReferences: Should be an array of strings,\n" +
        "Invalid birthday, Expected Format: 1999-06-22,\n" +
        "Invalid email,\n" +
        "Invalid phoneNumber,\n" +
        "Invalid gender, must be MALE/FEMALE or OTHERS,\n" +
        "Invalid moveInDate: Expected Format: 1999-06-22,\n" +
        "Invalid moveOutDate: Expected Format: 1999-06-22,\n" +
        "Invalid isComplete, has to be true or false (boolean)\n" +
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
    "flatId": "18-921-981",
    "filters": {
      "age": {
        "min": 18,
        "max": 24
      },
      "gender": "MALE",
      "tags": ["COOKING"],
      "rent": {
        "min": 18,
        "max": 24
      },
      "permanent": true,
      "matchingTimeRange": true,
      "numberOfRoomMates": {
        "min": 3,
        "max": 5
      },
      "roomSize": {
        "min": 15,
        "max": 20
      },
      "numberOfBaths": {
        "min": 1,
        "max": 3
      },
    }
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

  let invalidFilters = {
    "filters": {
      "age": {
        "min": 18,
        "max": 24
      },
      "gender": "GENDER",
      "tags": ["BASKET"],
      "rent": {
        "min": -3,
        "max": -6
      },
      "permanent": "true",
      "matchingTimeRange": "true",
      "numberOfRoomMates": {
        "min": "3",
        "max": "5"
      },
      "roomSize": {
        "min": "15",
        "max": "20"
      },
      "numberOfBaths": {
        "min": "1",
        "max": "3"
      },
    }
  }

  test('10 Test valid input for all fields', () => {
    let res = UserValidator.validatePatchUser(validAllFields);
    expect(res.validationFoundErrors()).toBe(false);
  });

  test('11 Test invalid input fields', () => {
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

  test('12 Test invalid input with unexpected fields', () => {
    let res = UserValidator.validatePatchUser(unexpectedField);
    let expected = "Errors:\nUnknown Field: password\n" +
        "Mandatory fields are: \n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,firstName," +
                             "lastName,birthday,phoneNumber,email,flatId,isComplete,filters"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })

  test('13 Test invalid filters', () => {
    let res = UserValidator.validatePatchUser(invalidFilters);
    let expected = "Errors:\n" +
        "Invalid Filter Gender: Allowed valuesMALE,FEMALE,OTHERS,NOT SET,\n" +
        "Invalid Filter tag: BASKET is not a valid tag. Valid tags are: COOKING,SPORTS,INSTRUMENTS,CLEANLINESS,STUDENT,WORKING,PETS,PARTY,COFFEE,WINE,WOKO,JUWO,PEACEFUL,SMOKER,\n" +
        "Invalid Filter rent min: Should be of type number and positive,\n" +
        "Invalid Filter rent max: Should be of type number and positive,\n" +
        "Invalid filter permanent: has to be true, false (boolean) or null,\n" +
        "Invalid filter matchingTimeRange: has to be true or false (boolean),\n" +
        "Invalid Filter numberOfRoomMates min: Should be of type number and positive,\n" +
        "Invalid Filter numberOfRoomMates max: Should be of type number and positive,\n" +
        "Invalid Filter roomSize min: Should be of type number and positive,\n" +
        "Invalid Filter roomSize max: Should be of type number and positive,\n" +
        "Invalid Filter numberOfBaths min: Should be of type number and positive,\n" +
        "Invalid Filter numberOfBaths max: Should be of type number and positive\n" +
        "Mandatory fields are: \n" +
        "Optional fields are: description,biography,tags,pictureReferences,gender,moveInDate,moveOutDate,firstName," +
        "lastName,birthday,phoneNumber,email,flatId,isComplete,filters"
    expect(res.validationFoundErrors()).toBe(true);
    expect(res.toString()).toEqual(expected);
  })
})

