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
        "numberOfRoommates": 3
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

    test('test valid input for all fields', () => {
        let res = FlatValidator.validatePostFlat(validAllFields);
        expect(res.validationFoundErrors()).toBe(false);
    })

    test('test valid input for mandatory fields', () => {
        let res = FlatValidator.validatePostFlat(validMandatory);
        expect(res.validationFoundErrors()).toBe(false);
    })

    test('test invalid input fields', () => {
        let res = FlatValidator.validatePostFlat(invalidFields);
        expect(res.validationFoundErrors()).toBe(true);
    })

    test('test invalid input with missing fields', () => {
        let res = FlatValidator.validatePostFlat(missingMandatory);
        let expected = "Errors:\nJSON object does not contain required field: address\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('test invalid input with unexpected fields', () => {
        let res = FlatValidator.validatePostFlat(unexpectedField);
        let expected = "Errors:\nUnknown Field: hometown\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('test invalid date range', () => {
        let res = FlatValidator.validatePostFlat(invalidDateRange);
        let expected = "Errors:\nInvalid tag: test is not a valid tag. Valid tags are,\n" +
            "Invalid moveOutDate: moveInDate must be before moveOutDate\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('test json with null value', () => {
        let res = FlatValidator.validatePostFlat(containingNull);
        let expected = "Errors:\nname is null\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates"
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
        "numberOfRoommates": 3
    }

    let invalidFields = {
        "permanent": "false"
    }

    let unexpectedField = {
        "name": "test",
        "address": "test",
        "hometown": "zuerich"
    }

    test('test valid input for all fields', () => {
        let res = FlatValidator.validatePatchFlat(validAllFields);
        expect(res.validationFoundErrors()).toBe(false);
    })

    test('test invalid input fields', () => {
        let res = FlatValidator.validatePatchFlat(invalidFields);
        expect(res.validationFoundErrors()).toBe(true);
    })

    test('test invalid input with unexpected fields', () => {
        let res = FlatValidator.validatePatchFlat(unexpectedField);
        let expected = "Errors:\nUnknown Field: hometown\n" +
            "Mandatory fields are: \n" +
            "Optional fields are: description,biography,tags,pictureReferences,onlineStatus,moveInDate,moveOutDate,rent,permanent,roomSize,numberOfBaths,numberOfRoommates,name,address"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })
})

