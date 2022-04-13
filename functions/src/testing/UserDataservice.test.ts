// import {UserProfileDataService} from "../data-services/UserProfileDataService";
// import {InvalidMockUserRepository, ValidMockUserRepository} from "../repository/MockUserRepository";
//
//
// // Declaring mocks
//
// jest.mock('firebase/auth', () => {
//     const userCredentialMock = {
//         user: {
//             email: 'test@test.ch',
//             uid: '123',
//         }
//     }
//     return {
//         getAuth: jest.fn(),
//         createUserWithEmailAndPassword: jest.fn()
//             // Value for first test
//             .mockReturnValueOnce(Promise.resolve(userCredentialMock))
//             // Value for second test
//                 //Not needed for second test
//             // Value for third test
//             .mockRejectedValueOnce(Promise.reject(new Error("Firebase: Error (auth/email-already-in-use).")))
//             // Value for fourth tests
//             .mockReturnValueOnce(Promise.resolve(userCredentialMock)),
//             // Value for fifth tests
//                 //Not needed for fifth test
//             // Value for sixth tests
//                 //Not needed for sixth test
//             // Value for seventh tests
//                 //Not needed for seventh test
//             // Value for eighth tests
//                 //Not needed for eighth test
//             // Value for ninth tests
//                 //Not needed for ninth test
//             // Value for ninth tests
//                 //Not needed for tenth test
//         deleteUser: jest.fn()
//             // Default Value
//             .mockReturnValue(Promise.resolve("Successfully deleted user"))
//     }
// });
//
// jest.mock('../repository/UserRepository', () => {
//     return {
//         UserRepository: jest.fn()
//             // Value for first test
//             .mockImplementationOnce(() => new ValidMockUserRepository())
//             // Value for second test
//             .mockImplementationOnce(() => new ValidMockUserRepository())
//             // Value for third test
//             .mockImplementationOnce(() => new ValidMockUserRepository())
//             // Value for fourth test
//             .mockImplementationOnce(() => new InvalidMockUserRepository())
//             // Value for fifth test
//             .mockImplementationOnce(() => new ValidMockUserRepository())
//             // Value for sixth test
//             .mockImplementationOnce(() => new ValidMockUserRepository())
//             // Value for seventh test
//             .mockImplementationOnce(() => new InvalidMockUserRepository())
//             // Value for eighth test
//             .mockImplementationOnce(() => new ValidMockUserRepository())
//             // Value for ninth test
//             .mockImplementationOnce(() => new ValidMockUserRepository())
//             // Value for tenth test
//             .mockImplementationOnce(() => new InvalidMockUserRepository())
//     }
// });
//
// jest.mock('firebase-admin/lib/auth', () => {
//     return {
//         getAuth: jest.fn()
//             // Value for first test
//                 //Not needed for first test
//             // Value for second test
//                 //Not needed for second test
//             // Value for third test
//                 //Not needed for third test
//             // Value for fourth tests
//                 //Not needed for fourth test
//             // Value for fifth tests
//                 //Not needed for fifth test
//             // Value for sixth tests
//                 //Not needed for sixth test
//             // Value for seventh tests
//                 //Not needed for seventh test
//             // Value for eighth test
//             .mockImplementationOnce(() => new mockAdminAuth())
//             // Value for ninth test
//             .mockImplementationOnce(() => new invalidMockAdminAuth())
//             // Value for tenth test
//             .mockImplementationOnce(() => new mockAdminAuth())
//     }
// });
//
// // mock admin-auth
//
// class mockAdminAuth {
//     constructor() {}
//
//     deleteUser(profile_id: string): Promise<string> {
//         return Promise.resolve("Successfully deleted user " + profile_id);
//     }
// }
//
// class invalidMockAdminAuth {
//     constructor() {}
//
//     deleteUser(profile_id: string): Promise<string> {
//         return Promise.reject(new Error("Could not delete auth User"));
//     }
// }
//
// // Stub inputs
//
// class StubInputs {
//     // Stub inputs
//
//     static getValidUserPostBody(): any {
//         return {
//             firstName: "test",
//             lastName: "test",
//             birthday: "1999-06-22",
//             email: "test@test.ch",
//             phoneNumber: "0795553030",
//             password: "1234567"
//         }
//     }
//
//     static getValidUpdateBody(): any {
//         return {
//             firstName: "updatedName",
//             lastName: "updatedName"
//         }
//     }
//
//     static getCurrentDateStr(): string {
//         let today = new Date();
//         let dd = String(today.getDate()).padStart(2, '0');
//         let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//         let yyyy = today.getFullYear();
//         return  mm + '/' + dd + '/' + yyyy;
//     }
// }
//
//
// // Unit Tests
//
// describe("UserProfileDataService Test", () => {
//
//     // Post User Profile Tests
//
//     test('1 Test Valid Add UserProfile Request', () => {
//         const expected_response = {
//             profileId: "123",
//             firstName: "test",
//             lastName: "test",
//             description: "",
//             biography: "",
//             tags: [],
//             pictureReference: "",
//             matches: [],
//             viewed: [],
//             likes: [],
//             creationDate: new Date(StubInputs.getCurrentDateStr()),
//             onlineStatus: "ONLINE",
//             birthday: "1999-06-22",
//             email: "test@test.ch",
//             phoneNumber: "0795553030",
//             gender: "NOT SET",
//             isSearchingRoom: true,
//             isAdvertisingRoom: false,
//             moveInDate: new Date(NaN),
//             moveOutDate: new Date(NaN)
//         }
//
//         return UserProfileDataService.addUserProfile(StubInputs.getValidUserPostBody()).then(
//             (response) => {
//                 console.log(response);
//                 expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response))
//             }
//         );
//     });
//
//     test('2 Test Validator Error Add UserProfile Request', () => {
//         // This test should only examine the correct returning of an error message in case of a validation error
//         // -> This is why only a single invalid input is tested
//         // -> To examine the correct behaviour of the validator there exists a separate test file
//
//         const expected_response = "Errors:\ninvalid email"
//         let invalid_input = StubInputs.getValidUserPostBody();
//         invalid_input.email = "invalid_email"
//
//         return UserProfileDataService.addUserProfile(invalid_input)
//             .then(
//                 (response) => {
//                     console.log(response);
//                     throw new TypeError("Expected a validation error")
//                 }
//             )
//             .catch(
//                 (error) => {
//                     expect(error).toEqual(new Error(expected_response))
//                 }
//             )
//     });
//
//     test('3 Test UserAlreadyExists Error Add UserProfile Request', () => {
//         const expected_response = "Firebase: Error (auth/email-already-in-use)."
//
//         return UserProfileDataService.addUserProfile(StubInputs.getValidUserPostBody())
//             .then(
//                 (response) => {
//                     console.log(response);
//                     throw new TypeError("Expected a userAlreadyExists error")
//                 }
//             )
//             .catch(
//                 (error) => {
//                     expect(error).toEqual(Promise.reject(new Error(expected_response)));
//                 }
//             )
//     });
//
//     jest.clearAllMocks();
//
//     test('4 Test Cannot access Repo Add UserProfile Request', async () =>  {
//         const expected_response = "Could not post user due to: Could not post User"
//         return UserProfileDataService.addUserProfile(StubInputs.getValidUserPostBody())
//             .then(
//                 (response) => {
//                     console.log(response);
//                     throw new TypeError("Expected a repo error")
//                 }
//             )
//             .catch(
//                 (error) => {
//                     expect(error).toEqual(new Error(expected_response));
//                 }
//             )
//     });
//
//     // Patch Tests
//
//     test('5 Test Valid Patch  UserProfile Request', () => {
//         const expected_response = "Successfully updated user 123"
//
//         return UserProfileDataService.updateUser(StubInputs.getValidUpdateBody(), "123").then(
//             (response) => {
//                 console.log(response);
//                 expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response))
//             }
//         );
//     });
//
//     test('6 Test Validator Error Patch UserProfile Request', () => {
//         // This test should only examine the correct returning of an error message in case of a validation error
//         // -> This is why only a single invalid input is tested
//         // -> To examine the correct behaviour of the validator there exists a separate test file
//
//         const expected_response = "Errors:\ninvalid phoneNumber"
//         let invalid_input = StubInputs.getValidUpdateBody();
//         invalid_input.phoneNumber = "0"
//
//         return UserProfileDataService.updateUser(invalid_input, "123")
//             .then(
//                 (response) => {
//                     console.log(response);
//                     throw new TypeError("Expected a validation error")
//                 }
//             )
//             .catch(
//                 (error) => {
//                     expect(error).toEqual(new Error(expected_response))
//                 }
//             )
//     });
//
//     test('7 Test Cannot access Repo Patch UserProfile Request', async () =>  {
//         const expected_response = "Could not update User"
//         return UserProfileDataService.updateUser(StubInputs.getValidUpdateBody(), "123")
//             .then(
//                 (response) => {
//                     console.log(response);
//                     throw new TypeError("Expected a repo error")
//                 }
//             )
//             .catch(
//                 (error) => {
//                     expect(error).toEqual(new Error(expected_response));
//                 }
//             )
//     });
//
//     // Delete Tests
//
//     test('8 Test Valid Delete UserProfile Request', () => {
//         const expected_response = "Successfully deleted user 123"
//
//         return UserProfileDataService.deleteUser("123").then(
//             (response) => {
//                 console.log(response);
//                 expect(JSON.stringify(response)).toEqual(JSON.stringify(expected_response))
//             }
//         );
//     });
//
//     test('9 Test Cannot access Auth Delete UserProfile Request', async () =>  {
//         const expected_response = "Could not delete auth User"
//         return UserProfileDataService.deleteUser("123")
//             .then(
//                 (response) => {
//                     console.log(response);
//                     throw new TypeError("Expected a auth error")
//                 }
//             )
//             .catch(
//                 (error) => {
//                     expect(error).toEqual(new Error(expected_response));
//                 }
//             )
//     });
//
//     test('10 Test Cannot access Repo Delete UserProfile Request', async () =>  {
//         const expected_response = "Error: User was deleted from auth but not from firestore: Could not delete User"
//         return UserProfileDataService.deleteUser("123")
//             .then(
//                 (response) => {
//                     console.log(response);
//                     throw new TypeError("Expected a repo error")
//                 }
//             )
//             .catch(
//                 (error) => {
//                     expect(error).toEqual(new Error(expected_response));
//                 }
//             )
//     });
//
// });
