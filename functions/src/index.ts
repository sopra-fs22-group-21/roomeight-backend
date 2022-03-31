import * as functions from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const userprofiles = functions.https.onRequest((request, response) => {
  response.send(mock_user_profile);
});

export const flatprofiles = functions.https.onRequest((request, response) => {
  response.send(mock_flat_profile);
});

export const profiles = functions.https.onRequest((request, response) => {

  response.send(mock_user_profile);
});

const mock_user_profile = {
  Name: "test",
  Description: "test",
  Biography: "test",
  Tags: "test",
  PictureReference: "test",
  Matches: "test",
  CreationDate: new Date().getDate().toString(),
  OnlineStatus: "Online",
  Birthday: new Date().getDate().toString(),
  EmailAddress: "test@test.ch",
  PhoneNumber: "123",
  Gender: "Male",
  isSearchingRoom: "true",
  isAdvertisingRoom: "false",
  MoveInDate: new Date().getDate().toString(),
  MoveOutDate: new Date().getDate().toString()
}

const mock_flat_profile = {
  Name: "test",
  Description: "test",
  Biography: "test",
  Tags: "test",
  PictureReference: "test",
  Matches: "test",
  CreationDate: new Date().getDate().toString(),
  OnlineStatus: "Online",
  Address: {
    Street: "test",
    City: "test",
    Province: "test",
    PostalCode: "test",
    Country: "test"
  },
  Rent: "1",
  Permanent: "true",
  MoveInDate: new Date().getDate().toString(),
  MoveOutDate: new Date().getDate().toString(),
  NumberOfRooms: "1",
  RoomSize: "1",
  NumberOfBaths: "1",
  RoomMates: {
    RoomMate1: mock_user_profile,
    RoomMate2: mock_user_profile
  }
}
