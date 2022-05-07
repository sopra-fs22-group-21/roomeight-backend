import {ValidMockUserRepository} from "../main/repository/MockUserRepository";
import {ValidMockFlatRepository} from "../main/repository/MockFlatRepository";
import {FlatProfileDataService} from "../main/data-services/FlatProfileDataService";


// Unit Tests

describe("FlatProfileDataService Test", () => {
    // GetById Tests

    test('1 Test Valid GetById Request', () => {
        const expected_response = "{\"name\":\"test\",\"description\":\"test\",\"biography\":\"test\",\"tags\":[\"test\"],\"pictureReferences\":[\"test\"],\"likes\":[],\"creationDate\":\"1970-01-01T00:00:00.000Z\",\"moveInDate\":\"1970-01-01T00:00:00.000Z\",\"moveOutDate\":\"1970-01-01T00:00:00.000Z\",\"address\":\"test\",\"rent\":500,\"permanent\":false,\"roomSize\":18,\"numberOfBaths\":1,\"roomMates\":{},\"matches\":{}}";
        const ds = new FlatProfileDataService(new ValidMockFlatRepository(), new ValidMockUserRepository());

        return ds.getProfileByIdFromRepo("123").then(
            (response) => {
                console.log(response);
                expect(JSON.stringify(response)).toEqual(expected_response);
            }
        );
    });
})