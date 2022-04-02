import * as functions from "firebase-functions";
import * as express from "express"


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const userprofile_app = express();
const flatprofile_app = express();
const profile_app = express();

userprofile_app.get('/', async (req, res) => {
  res.status(200).send(mock_user_profile_list);
});

userprofile_app.post('/', async (req, res) => {
  res.status(404).send();
});

userprofile_app.put('/', async (req, res) => {
  res.status(404).send();
});

userprofile_app.delete('/', async (req, res) => {
  res.status(404).send();
});

exports.userprofiles = functions.https.onRequest(userprofile_app);

flatprofile_app.get('/', async (req, res) => {
  res.status(200).send(mock_flat_profile);
});

flatprofile_app.post('/', async (req, res) => {
  res.status(404).send();
});

flatprofile_app.put('/', async (req, res) => {
  res.status(404).send();
});

flatprofile_app.delete('/', async (req, res) => {
  res.status(404).send();
});

exports.flatprofiles = functions.https.onRequest(userprofile_app);


profile_app.get('/', async (req, res) => {
  res.status(200).send(mock_user_profile_list);
});

profile_app.post('/', async (req, res) => {
  res.status(404).send();
});

profile_app.put('/', async (req, res) => {
  res.status(404).send();
});

profile_app.delete('/', async (req, res) => {
  res.status(404).send();
});

exports.profiles = functions.https.onRequest(profile_app);


const mock_user_profile_list = [
    {
        FirstName: "test",
        LastName: "test",
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
    },
    {
        FirstName: "test",
        LastName: "test",
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
]

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
