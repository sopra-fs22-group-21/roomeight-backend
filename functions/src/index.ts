import * as functions from "firebase-functions";
import * as express from "express"
import {UserProfileDataService} from "./data-services/UserProfileDataService";
import {getAuth} from "firebase-admin/lib/auth";


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// Required instances
const userprofile_app = express();
const flatprofile_app = express();
const profile_app = express();
const cors = require('cors');

// Export functions and set allowed origins
exports.userprofiles = functions.https.onRequest(userprofile_app);
userprofile_app.use(cors({ origin: "*" }));
exports.flatprofiles = functions.https.onRequest(userprofile_app);
flatprofile_app.use(cors({ origin: "*" }));
exports.profiles = functions.https.onRequest(profile_app);
profile_app.use(cors({ origin: "*" }));


// User Operations

// Get Users
userprofile_app.get('/', async (req, res) => {
    res.status(200).send(mock_user_profile_list);
});

// Create User
userprofile_app.post('/', async (req, res) => {
    functions.logger.debug("Started Post Request", {structuredData: true});
    return UserProfileDataService.addUserProfile(req.body)
        .then((response) => {
                res.set('Access-Control-Allow-Origin', '*')
                res.status(200).send(response);
            }
        )
        .catch ((e) => {
            // If validation fails return status 400 and list of errors
            if (e.message == "Firebase: Error (auth/email-already-in-use).") {
                res.status(409).send("User already exists!");
            }
            functions.logger.debug(e, {structuredData: true})
            res.status(400).send(e.message);
        });
});


// Update User
userprofile_app.patch('/:profileId', async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Get token from header
        const idToken = req.headers.authorization.split('Bearer ')[1]
        // Verify token
        getAuth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                if (uid == req.params.profileId) {
                    // If uid of token matches the profileId continue with request processing
                    UserProfileDataService.updateUser(req.body)
                        .then(
                            (response) => {
                                res.set('Access-Control-Allow-Origin', '*')
                                res.status(200).send(response);
                            }
                        )
                        .catch(
                            (e) => {
                                functions.logger.debug(e, {structuredData: true})
                                res.status(400).send(e.message);
                            }
                        );
                } else {
                    // Else return NotAuthorized-Exception
                    res.status(403).send("Not authorized to update the selected user!");
                }
            })
            .catch((error) => {
                res.status(401).send("Authorization failed: " + error);
            });

    } else {
        res.status(401).send("Authorization failed: No authorization header present");
    }
});

// Delete User
userprofile_app.delete('/', async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        //const idToken = req.headers.authorization.split('Bearer ')[1]
        // userprofile data service call
    }
    res.status(404).send();
});


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
flatprofile_app.patch('/', async (req, res) => {
    res.status(404).send();
});

// Delete Flat
flatprofile_app.delete('/', async (req, res) => {
    res.status(404).send();
});


// General Profile Operations

// Get specific Profile
profile_app.get('/', async (req, res) => {
    res.status(200).send(mock_user_profile_list);
});

//Todo: Complete rest spec
profile_app.post('/', async (req, res) => {
    res.status(404).send();
});

profile_app.patch('/', async (req, res) => {
    res.status(404).send();
});

profile_app.delete('/', async (req, res) => {
    res.status(404).send();
});



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
