import { FlatValidator } from '../main/validation/FlatValidator'



describe('Validate PostFlat', () => {

    let validAllFields = {
        "name": "test",
        "address": "test",
        "description": "test",
        "biography": "test",
        "tags": ["test"],
        "pictureReferences": ["test"],
        "moveInDate": "1999-06-22",
        "moveOutDate": "1999-06-22",
        "rent": 500,
        "permanent": false,
        "roomSize": 18,
        "numberOfBaths": 1,
        "roomMates": [],
        "matches": []
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
        "numberOfBaths": 1,
        "roomMates": [],
        "matches": []
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
            "Optional fields are: description,biography,tags,pictureReferences,likes,onlineStatus,moveInDate,moveOutDate,address,rent,permanent,roomSize,numberOfBaths,roomMates,matches"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('test invalid input with unexpected fields', () => {
        let res = FlatValidator.validatePostFlat(unexpectedField);
        let expected = "Errors:\nUnknown Field: hometown\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,likes,onlineStatus,moveInDate,moveOutDate,address,rent,permanent,roomSize,numberOfBaths,roomMates,matches"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('test invalid date range', () => {
        let res = FlatValidator.validatePostFlat(invalidDateRange);
        let expected = "Errors:\nmoveInDate must be before moveOutDate\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,likes,onlineStatus,moveInDate,moveOutDate,address,rent,permanent,roomSize,numberOfBaths,roomMates,matches"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })

    test('test json with null value', () => {
        let res = FlatValidator.validatePostFlat(containingNull);
        let expected = "Errors:\nname is null\n" +
            "Mandatory fields are: name,address\n" +
            "Optional fields are: description,biography,tags,pictureReferences,likes,onlineStatus,moveInDate,moveOutDate,address,rent,permanent,roomSize,numberOfBaths,roomMates,matches"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })
})


describe('Validate PatchUser', () => {

    let validAllFields = {
        "description": "test",
        "biography": "test",
        "tags": ["test"],
        "pictureReferences": ["test"],
        "moveInDate": "1999-06-22",
        "moveOutDate": "1999-06-22",
        "rent": 500,
        "permanent": false,
        "roomSize": 18,
        "numberOfBaths": 1,
        "roomMates": [],
        "matches": []
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
            "Optional fields are: description,biography,tags,pictureReferences,roomSize,rent,permanent,numberOfRoommates,numberOfBaths,moveInDate,moveOutDate,name,address,roomMates,matches,onlineStatus"
        expect(res.validationFoundErrors()).toBe(true);
        expect(res.toString()).toEqual(expected);
    })
})

