import {ValidMockUserRepository} from "../main/repository/MockUserRepository";
import {ValidMockFlatRepository} from "../main/repository/MockFlatRepository";
import {ValidMockChatRepository} from "../main/repository/MockChatRepository";

jest.doMock('../main/repository/FlatRepository', ()=>{
    return {
        getProfileById: jest.fn().mockImplementation(
            (profileId)=>{
                return {
                    name: "flatTestName",
                    address: "AdressX",
                    description: "descriptionX",
                    biography: "BioX",
                    tags: ["TAGX"],
                    pictureReferences: ["referenceX"],
                    moveInDate: new Date(),
                    moveOutDate: new Date(),
                    rent: 500,
                    permanent: false,
                    roomSize: 18,
                    numberOfBaths: 1,
                    roomMates: ["123-advertising"],
                    likes: [],
                    matches: ["123"],
                    flatId: "flt$0afc1a97-2cff-4ba3-9d27-c5cad8295acb",
                    creationDate: new Date(),
                    addressCoordinates: {
                        longitude: 12.34,
                        latitude: 56.78
                    }
                }
            }
        )
    }
})

jest.doMock('../main/repository/UserRepository', ()=>{
    return {
        constructor: jest.fn().mockImplementation(()=>{return null}),
        getProfiles: jest.fn().mockImplementation(()=>{return null}),
        getProfileById: jest.fn().mockImplementation((profileId)=>{
            return {
                firstName: 'Mock first_name',
                moveInDate: new Date(),
                likes: [],
                phoneNumber: '0795556677',
                flatId: '123',
                tags: [],
                isSearchingRoom: false,
                isAdvertisingRoom: true,
                biography: '',
                profileId: '123-advertising',
                gender: 'NOT SET',
                pictureReferences: [],
                birthday:  new Date(),
                description: '',
                lastName: 'Mock last_name',
                onlineStatus: 'ONLINE',
                viewed: [],
                creationDate:  new Date(),
                moveOutDate:  new Date(),
                matches: [],
                email: 'test@test.com',
                filters: {},
                isComplete: false
            }
        })
    }
})

jest.doMock('../main/repository/ChatRepository', ()=>{
    return {
        getMembershipValues: jest.fn().mockImplementation(() => {
            return [
                'flt$test1'
            ]
        })
    }
})

const { chatService } = require('../main/chat-service/chatService')


/**
 * userProfiles with different attributes:
 * 'didMatch' - user has a match with other profile -> 'flt$match' createChat('flt$match', didMatch-...)
 * 'didNotMatch' - contrary
 * 'hasChat' - already has a chat with other profile
 * 'doesNotHaveChat' - contrary
 * 'FLAT' - user is part of a flat
 * 'USER' - is searching
 *
 */

describe("ChatService - chat operations", () => {
    let chatservice: typeof chatService;
    beforeEach(()=>{
        chatservice = new chatService(new ValidMockUserRepository(), new ValidMockChatRepository(), new ValidMockFlatRepository())
    })
    // Post Chat Tests
    test('1 Test invalid did not match request', async () => {
        try {
            await chatservice.createChat('flt$match', 'didNotMatch')
        } catch (e: any) {
            expect(e.message).toEqual('User has not yet matched with this profile - cannot create chat')
        }
    });

    test('1 Test invalid already has chat request', async () => {
        try {
            await chatservice.createChat('flt$match', 'didMatch-hasChat')
        } catch (e: any) {
            expect(e.message).toEqual('User already has a chat with this profile')
        }
    });
});
