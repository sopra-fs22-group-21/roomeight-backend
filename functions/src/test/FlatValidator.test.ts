import { FlatValidator } from '../main/validation/FlatValidator'



describe('Validate PostFlat', () => {

    let validAllFields = {
        "name": "test",
        "address": "test",
        "description": "test",
        "biography": "test",
        "tags": ["COOKING"],
        "pictureReferences": ["test"],
        "moveInDate": "1999-06-22",
        "moveOutDate": "1999-06-22",
        "rent": 500,
        "permanent": false,
        "roomSize": 18,
        "numberOfBaths": 1,
        "numberOfRoommates": 3,
        "addressCoordinates": {
            "latitude": 47.5,
            "longitude": 8.55
        }
    }

    let invalidFields = {
        "name": "test",
        "address": "test",
        "permanent": "false"
    }

    let validMandatory = {
        "name": "test",
        "address": "test"
    }

    let missingMandatory = {
        "name": "test"
    }

    let unexpectedField = {
        "name": "test",
        "address": "test",
        "hometown": "zuerich"
    }

    let invalidDateRange = {
        "name": "test",
        "address": "test",
        "description": "test",
        "biography": "test",
        "tags": ["test"],
        "pictureReferences": ["test"],
        "moveInDate": "1999-06-26",
        "moveOutDate": "1999-06-22",
        "rent": 500,
        "permanent": false,
        "roomSize": 18,
        "numberOfBaths": 1
    }

    let containingNull = {
        "name": null,
        "address": "test",
    }

    let invalidAllFields = {
        "name": 18,
        "address": false,
        "description": 13,
        "biography": true,
        "tags": ["BASKET"],
        "pictureReferences": [12],
        "moveInDate": "15",
        "moveOutDate": "14",
        "rent": -50,
        "permanent": "yes",
        "roomSize": -1,
        "numberOfBaths": "2",
        "numberOfRoommates": "3",
        "addressCoordinates": {
            "latitude": "47.",
            "longitude": "8.55"
        }
    }

    test('1 Test valid input for all fields', () => {
        let res = FlatValidator.validatePostFlat(validAllFields);
        expect(res.validationFoundErrors()).toBe(false);
    })

    test('2 Test valid input for mandatory fields', () => {
        let res = FlatValidator.validatePostFlat(validMandatory);
        expect(res.validationFoundErrors()).toBe(false);
    })

    test('3 Test invalid input fields', () => {
        let res = FlatValidator.validatePostFlat(invalidFields);
        expect(res.validationFoundErrors()).toBe(true);
    })

    test('4 Test invalid input with missing fields', () => {
        let res = FlatValidator.validatePostFlat(missingMandatory);
        let expected = "Errors:\nJSON object does not contain required field: address\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,addressCoordinates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('5 Test invalid input with unexpected fields', () => {
        let res = FlatValidator.validatePostFlat(unexpectedField);
        let expected = "Errors:\nUnknown Field: hometown\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,addressCoordinates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('6 Test invalid date range', () => {
        let res = FlatValidator.validatePostFlat(invalidDateRange);
        let expected = "Errors:\nInvalid tag: test is not a valid tag. Valid tags are: COOKING,SPORTS,INSTRUMENTS,CLEANLINESS,STUDENT,WORKING,PETS,PARTY,COFFEE,WINE,WOKO,JUWO,PEACEFUL,SMOKER,\n" +
            "Invalid moveOutDate: moveInDate must be before moveOutDate\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,addressCoordinates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('7 Test json with null value', () => {
        let res = FlatValidator.validatePostFlat(containingNull);
        let expected = "Errors:\nname is null\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,addressCoordinates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('8 Test invalid input for all fields', () => {
        let res = FlatValidator.validatePostFlat(invalidAllFields);
        let expected = "Errors:\nInvalid name: Should be of type string and have less than 300 signs,\n" +
            "Invalid address: Should be of type string and have less than 300 signs,\n" +
            "Invalid description: Should be of type string and have less than 300 signs,\n" +
            "Invalid biography: Should be of type string and have less than 300 signs,\n" +
            "Invalid tag: BASKET is not a valid tag. Valid tags are: COOKING,SPORTS,INSTRUMENTS,CLEANLINESS,STUDENT,WORKING,PETS,PARTY,COFFEE,WINE,WOKO,JUWO,PEACEFUL,SMOKER,\n" +
            "invalid pictureReferences: Should be an array of strings,\n" +
            "Invalid moveInDate: Expected Format: 1999-06-22,\n" +
            "Invalid moveOutDate: Expected Format: 1999-06-22,\n" +
            "Invalid rent: Should be of type number,\n" +
            "Invalid permanent: Has to be true or false (boolean),\n" +
            "Invalid roomSize: Should be of type number,\n" +
            "Invalid numberOfBaths: Should be of type number,\n" +
            "Invalid addressCoordinates: Should contain latitude and longitude, both of type number\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,addressCoordinates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })
})


describe('Validate PatchUser', () => {

    let validAllFields = {
        "description": "test",
        "biography": "test",
        "tags": ["COOKING"],
        "pictureReferences": ["test"],
        "moveInDate": "1999-06-22",
        "moveOutDate": "1999-06-22",
        "rent": 500,
        "permanent": false,
        "roomSize": 18,
        "numberOfBaths": 1,
        "numberOfRoommates": 3,
        "addressCoordinates": {
            "latitude": 47.5,
            "longitude": 8.55
        }
    }

    let invalidFields = {
        "permanent": "false"
    }

    let unexpectedField = {
        "name": "test",
        "address": "test",
        "hometown": "zuerich"
    }

    test('1 Test valid input for all fields', () => {
        let res = FlatValidator.validatePatchFlat(validAllFields);
        expect(res.validationFoundErrors()).toBe(false);
    })

    test('2 Test invalid input fields', () => {
        let res = FlatValidator.validatePatchFlat(invalidFields);
        expect(res.validationFoundErrors()).toBe(true);
    })

    test('3 Test invalid input with unexpected fields', () => {
        let res = FlatValidator.validatePatchFlat(unexpectedField);
        let expected = "Errors:\nUnknown Field: hometown\n" +
            "Mandatory fields are: \n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,name,address,addressCoordinates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })
})

