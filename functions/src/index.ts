import * as functions from "firebase-functions";
import * as express from "express";
import {UserProfileDataService} from "./main/data-services/UserProfileDataService";
import {getAuth} from "firebase-admin/auth";
import {config} from "../firebase_config";
import {UserRepository} from "./main/repository/UserRepository";
import sanitizeHtml = require("sanitize-html");
import {FlatRepository} from "./main/repository/FlatRepository";
import {FlatProfileDataService} from "./main/data-services/FlatProfileDataService";



// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const app = admin.initializeApp(config);

// Required instances
const userprofile_app = express();
const flatprofile_app = express();
const cors = require('cors');

// Repository Initialization
const userRepo = new UserRepository(app);
const flatRepo = new FlatRepository(app)

// Data Service Initialization
const userProfileDataService = new UserProfileDataService(userRepo, flatRepo, app);
const flatProfileDataService = new FlatProfileDataService(flatRepo, userRepo);

// Export functions and set allowed origins
exports.userprofiles = functions.https.onRequest(userprofile_app);
userprofile_app.use(cors({ origin: "*" }));
exports.flatprofiles = functions.https.onRequest(flatprofile_app);
flatprofile_app.use(cors({ origin: "*" }));


// User Operations

// Get specific Profile
userprofile_app.get('/:profileId', async (req, res) => {
    const profile_id = sanitizeHtml(req.params.profileId);
    let result;

    result = await userProfileDataService.getProfileByIdFromRepo(profile_id)
        .catch((error) => {
            if (error.message == "DB entry does not have expected format") {
                res.status(500).send(error.message)
            } else if(error.message == "User Profile not found!"){
                res.status(404).send("User Profile with id " + profile_id + " not found!")
            } else  {
                res.status(400).send(error.message)
            }
        })
    res.status(200).send(result);
});

// Create User
userprofile_app.post('/', async (req, res) => {
    functions.logger.debug("Started User Post Request", {structuredData: true});
    return userProfileDataService.addUserProfile(req.body)
        .then((data_service_response) => {
                res.set('Access-Control-Allow-Origin', '*')
                res.status(200).send(data_service_response);
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
    functions.logger.debug("Started User Patch Request", {structuredData: true});
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Get Profile Id and Token from request
        const idToken = req.headers.authorization.split('Bearer ')[1]
        const profile_id = sanitizeHtml(req.params.profileId);

        getAuth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                if (uid == profile_id) {
                    // If uid of token matches the profileId continue with request processing
                    userProfileDataService.updateUser(req.body, profile_id)
                        .then(
                            (data_service_response) => {
                                res.set('Access-Control-Allow-Origin', '*')
                                res.status(200).send(data_service_response);
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
userprofile_app.delete('/:profileId', async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Get token from header
        const idToken = req.headers.authorization.split('Bearer ')[1]
        const profile_id = sanitizeHtml(req.params.profileId);
        // Verify token
        getAuth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                if (uid == profile_id) {
                    // If uid of token matches the profileId continue with request processing
                    userProfileDataService.deleteUser(profile_id)
                        .then(
                            (data_service_response) => {
                                res.set('Access-Control-Allow-Origin', '*')
                                res.status(200).send(data_service_response);
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
                    res.status(403).send("Not authorized to delete the selected user!");
                }
            })
            .catch((error) => {
                res.status(401).send("Authorization failed: " + error);
            });

    } else {
        res.status(401).send("Authorization failed: No authorization header present");
    }
});

userprofile_app.post('/likeUser/:', async (req, res) => {
    res.status(404).send();
});


userprofile_app.post('/likeFlat', async (req, res) => {
    res.status(404).send();
});

// Flat Operation

// Get Profiles
flatprofile_app.get('/', async (req, res) => {
    let result;

    result = await flatProfileDataService.getProfilesFromRepo()
        .catch((error) => {
                res.status(400).send(error.message)
        })
    res.status(200).send(result);
});

// Get specific Profile
flatprofile_app.get('/:profileId', async (req, res) => {
    const profile_id = sanitizeHtml(req.params.profileId);
    let result;

    result = await flatProfileDataService.getProfileByIdFromRepo(profile_id)
        .catch((error) => {
            if (error.message == "DB entry does not have expected format") {
                res.status(500).send(error.message)
            } else if(error.message == "Flat Profile not found!"){
                res.status(404).send("Flat Profile with id " + profile_id + " not found!")
            } else  {
                res.status(400).send(error.message)
            }
        })
    res.status(200).send(result);
});

// Create Flat
flatprofile_app.post('/', async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1]
        getAuth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                functions.logger.debug("Started Flat Post Request", {structuredData: true});
                return flatProfileDataService.addFlatProfile(req.body, decodedToken.uid)
                    .then((data_service_response) => {
                            res.set('Access-Control-Allow-Origin', '*')
                            res.status(200).send(data_service_response);
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
            })
            .catch((error) => {
                res.status(401).send("Authorization failed: " + error);
            });
    } else {
        res.status(401).send("Authorization failed: No authorization header present");
    }
});

// Add Room Mate
// Todo: Add reference to the room mate array
flatprofile_app.post('/roommate/:mate_id', async (req, res) => {
    res.status(404).send();
});

// Update Flat
// flatprofile_app.patch('/:profileId', async (req, res) => {
//     functions.logger.debug("Started Flat Patch Request", {structuredData: true});
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//         // Get Profile Id and Token from request
//         const idToken = req.headers.authorization.split('Bearer ')[1]
//         const profile_id = sanitizeHtml(req.params.profileId);
//
//         getAuth()
//             .verifyIdToken(idToken)
//             .then((decodedToken) => {
//                 functions.logger.debug("Started Flat Post Request", {structuredData: true});
//                 if (uid == profile_id) {
//                     // If uid of token matches the profileId continue with request processing
//                     userProfileDataService.updateUser(req.body, profile_id)
//                         .then(
//                             (data_service_response) => {
//                                 res.set('Access-Control-Allow-Origin', '*')
//                                 res.status(200).send(data_service_response);
//                             }
//                         )
//                         .catch(
//                             (e) => {
//                                 // Return HTTP Code 400 if error occurred
//                                 functions.logger.debug(e, {structuredData: true})
//                                 res.status(400).send(e.message);
//                             }
//                         );
//                 } else {
//                     // Else return NotAuthorized-Exception
//                     res.status(403).send("Not authorized to update the selected user!");
//                 }
//             })
//             .catch((error) => {
//                 res.status(401).send("Authorization failed: " + error);
//             });
//
//     } else {
//         res.status(401).send("Authorization failed: No authorization header present");
//     }
// });

// Delete Flat
flatprofile_app.delete('/:profileId', async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Get token from header
        const idToken = req.headers.authorization.split('Bearer ')[1]
        const profile_id = sanitizeHtml(req.params.profileId);
        // Verify token
        getAuth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                functions.logger.debug("Started Flat Delete Request", {structuredData: true});
                // ToDo get profile id via req.params
                const user_uid = decodedToken.user_id;
                flatProfileDataService.deleteFlat(profile_id, user_uid)
                    .then(
                        (data_service_response) => {
                            res.set('Access-Control-Allow-Origin', '*')
                            res.status(200).send(data_service_response);
                        }
                    )
                    .catch(
                        (e) => {
                            // functions.logger.debug(e, {structuredData: true})
                            res.status(400).send(e.message);
                        }
                    );
            })
            .catch((error) => {
                res.status(401).send("Authorization failed: " + error);
            });

    } else {
        res.status(401).send("Authorization failed: No authorization header present");
    }
});

flatprofile_app.post('/like', async (req, res) => {
    res.status(404).send();
});

