import * as functions from "firebase-functions";
import * as express from "express";
import {UserProfileDataService} from "./data-services/UserProfileDataService";
import {getAuth} from "firebase-admin/auth";
import {config} from "../firebase_config";


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp(config);

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
                // Return HTTP Code 409 if user already exists on Firebase Auth
                res.status(409).send("User already exists!");
            }
            functions.logger.debug(e, {structuredData: true})
            res.status(400).send(e.message);
        });
});


// Update User
userprofile_app.patch('/:profileId', async (req, res) => {
    functions.logger.debug("Started Patch Request", {structuredData: true});
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Get Profile Id and Token from request
        const idToken = req.headers.authorization.split('Bearer ')[1]
        const profile_id = req.params.profileId;

        getAuth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                functions.logger.debug(decodedToken, {structuredData: true});
                const uid = decodedToken.uid;
                if (uid == profile_id) {
                    // If uid of token matches the profileId continue with request processing
                    UserProfileDataService.updateUser(req.body, profile_id)
                        .then(
                            (response) => {
                                res.set('Access-Control-Allow-Origin', '*')
                                res.status(200).send(response);
                            }
                        )
                        .catch(
                            (e) => {
                                // Return HTTP Code 400 if error occurred
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
        firstName: "test",
        lastName: "test",
        description: "test",
        biography: "test",
        tags: "test",
        pictureReference: "test",
        matches: "test",
        creationDate: new Date().getDate().toString(),
        onlineStatus: "Online",
        birthday: new Date().getDate().toString(),
        email: "test@test.ch",
        phoneNumber: "123",
        gender: "Male",
        isSearchingRoom: "true",
        isAdvertisingRoom: "false",
        moveInDate: new Date().getDate().toString(),
        moveOutDate: new Date().getDate().toString()
    },
    {
        firstName: "test",
        lastName: "test",
        description: "test",
        biography: "test",
        tags: "test",
        pictureReference: "test",
        matches: "test",
        creationDate: new Date().getDate().toString(),
        onlineStatus: "Online",
        birthday: new Date().getDate().toString(),
        email: "test@test.ch",
        phoneNumber: "123",
        gender: "Male",
        isSearchingRoom: "true",
        isAdvertisingRoom: "false",
        moveInDate: new Date().getDate().toString(),
        moveOutDate: new Date().getDate().toString()
    }
]


const mock_flat_profile = {
  name: "test",
  description: "test",
  biography: "test",
  tags: "test",
  pictureReference: "test",
  matches: "test",
  creationDate: new Date().getDate().toString(),
  onlineStatus: "Online",
  address: {
    street: "test",
    city: "test",
    province: "test",
    postalCode: "test",
    country: "test"
  },
  rent: "1",
  permanent: "true",
  moveInDate: new Date().getDate().toString(),
  moveOutDate: new Date().getDate().toString(),
  numberOfRooms: "1",
  roomSize: "1",
  numberOfBaths: "1",
  roomMates: {
    roomMate1: mock_user_profile_list,
    roomMate2: mock_user_profile_list
  }
}
