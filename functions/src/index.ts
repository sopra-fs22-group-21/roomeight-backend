import * as functions from "firebase-functions";
import * as express from "express"
import {UserProfileDataService} from "./data-services/UserProfileDataService";


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const userprofile_app = express();
const flatprofile_app = express();
const profile_app = express();


// User Operations

// Get Users
userprofile_app.get('/', async (req, res) => {
    res.status(200).send(mock_user_profile_list);
});

// Create User
userprofile_app.post('/', async (req, res) => {
    functions.logger.debug("Entered index", {structuredData: true});
    return UserProfileDataService.addUserProfile(req.body)
        .then((response) => {
                res.status(200).send(response);
            }
        )
        .catch ((e) => {
            // If validation fails return status 400 and list of errors
            res.status(400).send(e.message);
        });
});

// Update User
userprofile_app.put('/', async (req, res) => {
    res.status(404).send();
});

// Delete User
userprofile_app.delete('/', async (req, res) => {
    res.status(404).send();
});

exports.userprofiles = functions.https.onRequest(userprofile_app);


// Flat Operation

// Get Flats
flatprofile_app.get('/', async (req, res) => {
    res.status(200).send(mock_flat_profile);
});

// Create Flat
flatprofile_app.post('/', async (req, res) => {
    res.status(404).send();
});

// Update Flat
flatprofile_app.put('/', async (req, res) => {
    res.status(404).send();
});

// Delete Flat
flatprofile_app.delete('/', async (req, res) => {
    res.status(404).send();
});

exports.flatprofiles = functions.https.onRequest(userprofile_app);


// General Profile Operations

// Get specific Profile
profile_app.get('/', async (req, res) => {
    res.status(200).send(mock_user_profile_list);
});

//Todo: Complete rest spec
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
    RoomMate1: mock_user_profile_list,
    RoomMate2: mock_user_profile_list
  }
}
