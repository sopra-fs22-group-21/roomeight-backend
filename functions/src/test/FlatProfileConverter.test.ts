import {FlatProfileConverter} from "../main/converters/FlatProfileConverter";

describe('ValidatorReport test', () => {
    let json_body = {
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
    };

    test('report should match the errormessage', () => {
        let res = FlatProfileConverter.convertPostDto(json_body);
        // TODO: expect res to match predefined object
        expect(res).toBeDefined();
    })
})