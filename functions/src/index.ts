import * as express from "express";
import { getAuth } from "firebase-admin/auth";
import * as functions from "firebase-functions";
import { config } from "../firebase_config";
import { chatService } from "./main/chat-service/chatService";
import { Assigner } from "./main/data-services/Assigner";
import { FlatProfileDataService } from "./main/data-services/FlatProfileDataService";
import { UserProfileDataService } from "./main/data-services/UserProfileDataService";
import { ChatRepository } from "./main/repository/ChatRepository";
import { FlatRepository } from "./main/repository/FlatRepository";
import { UserRepository } from "./main/repository/UserRepository";
import sanitizeHtml = require("sanitize-html");

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
const app = admin.initializeApp(config);

// Required instances
const userprofile_app = express();
const flatprofile_app = express();
const discover_app = express();
const chat_app = express();
const cors = require("cors");

// Repository Initialization
const userRepo = new UserRepository(app);
const flatRepo = new FlatRepository(app);
const chatRepo = new ChatRepository(app);

// Data Service Initialization
const userProfileDataService = new UserProfileDataService(
  userRepo,
  flatRepo,
  app
);
const flatProfileDataService = new FlatProfileDataService(flatRepo, userRepo);
const assigner = new Assigner(userRepo);

const chatservice = new chatService(userRepo, chatRepo, flatRepo);

// Export functions and set allowed origins
exports.userprofiles = functions
  .region("europe-west1")
  .runWith({
    maxInstances: 5,
    timeoutSeconds: 10,
  })
  .https.onRequest(userprofile_app);
userprofile_app.use(cors({ origin: "*" }));

exports.flatprofiles = functions
  .region("europe-west1")
  .runWith({
    maxInstances: 5,
    timeoutSeconds: 10,
  })
  .https.onRequest(flatprofile_app);
flatprofile_app.use(cors({ origin: "*" }));

exports.discover = functions
  .region("europe-west1")
  .runWith({
    maxInstances: 5,
    timeoutSeconds: 10,
  })
  .https.onRequest(discover_app);
discover_app.use(cors({ origin: "*" }));

exports.chats = functions
  .region("europe-west1")
  .runWith({
    maxInstances: 5,
    timeoutSeconds: 10,
  })
  .https.onRequest(chat_app);
chat_app.use(cors({ origin: "*" }));

// RTDB Triggers
exports.onNewMessage = functions
  .region("europe-west1")
  .runWith({
    maxInstances: 5,
    timeoutSeconds: 10,
  })
  .database.ref("/messages/{chatId}/{messageId}")
  .onCreate((snapshot, context) => {
    return chatservice.onMessageCreate(snapshot, context);
  });

exports.onDeleteChat = functions
  .region("europe-west1")
  .runWith({
    maxInstances: 5,
    timeoutSeconds: 10,
  })
  .database.ref("chats/{chatId}")
  .onDelete((snapshot, context) => {
    return chatservice.onChatDelete(snapshot, context);
  });

exports.onPresenceChange = functions
  .region("europe-west1")
  .runWith({
    maxInstances: 5,
    timeoutSeconds: 10,
  })
  .database.ref("chats/{chatId}/members/{userId}")
  .onUpdate((snapshot, context) => {
    return chatservice.onChatPresenceUpdate(snapshot, context);
  });

// User Operations

// Get User Profiles
userprofile_app.get("/", async (req, res) => {
  let result;

  result = await userProfileDataService.getProfilesFromRepo().catch((error) => {
    res.status(400).send(error.message);
  });
  res.status(200).send(result);
});

// Get specific User Profile
userprofile_app.get("/:profileId", async (req, res) => {
  const profile_id = sanitizeHtml(req.params.profileId);
  let result;

  result = await userProfileDataService
    .getProfileByIdFromRepo(profile_id)
    .catch((error) => {
      if (error.message == "DB entry does not have expected format") {
        res.status(500).send(error.message);
      } else if (error.message == "User Profile not found!") {
        res
          .status(404)
          .send("User Profile with id " + profile_id + " not found!");
      } else {
        res.status(400).send(error.message);
      }
    });
  res.status(200).send(result);
});

// Create User
userprofile_app.post("/", async (req, res) => {
  functions.logger.debug("Started User Post Request", { structuredData: true });
  return userProfileDataService
    .addUserProfile(req.body)
    .then((data_service_response) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send(data_service_response);
    })
    .catch((e) => {
      // If validation fails return status 400 and list of errors
      if (e.message == "Firebase: Error (auth/email-already-in-use).") {
        // Return HTTP Code 409 if user already exists on Firebase Auth
        res.status(409).send("User already exists!");
      }
      functions.logger.debug(e, { structuredData: true });
      res.status(400).send(e.message);
    });
});

// Update User
userprofile_app.patch("/:profileId", async (req, res) => {
  functions.logger.debug("Started User Patch Request", {
    structuredData: true,
  });
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get Profile Id and Token from request
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const profile_id = sanitizeHtml(req.params.profileId);

    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        if (uid == profile_id) {
          // If uid of token matches the profileId continue with request processing
          userProfileDataService
            .updateUser(req.body, profile_id)
            .then((data_service_response) => {
              res.set("Access-Control-Allow-Origin", "*");
              res.status(200).send(data_service_response);
            })
            .catch((e) => {
              // Return HTTP Code 400 if error occurred
              functions.logger.debug(e, { structuredData: true });
              res.status(400).send(e.message);
            });
        } else {
          // Else return NotAuthorized-Exception
          res.status(403).send("Not authorized to update the selected user!");
        }
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Delete User
userprofile_app.delete("/:profileId", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get token from header
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const profile_id = sanitizeHtml(req.params.profileId);
    // Verify token
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        if (uid == profile_id) {
          // If uid of token matches the profileId continue with request processing
          userProfileDataService
            .deleteUser(profile_id)
            .then((data_service_response) => {
              res.set("Access-Control-Allow-Origin", "*");
              res.status(200).send(data_service_response);
            })
            .catch((e) => {
              functions.logger.debug(e, { structuredData: true });
              res.status(400).send(e.message);
            });
        } else {
          // Else return NotAuthorized-Exception
          res.status(403).send("Not authorized to delete the selected user!");
        }
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// like operations
userprofile_app.post("/likeUser/:likedUserId", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get token from header
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const like_profile_id = sanitizeHtml(req.params.likedUserId);
    // Verify token
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        userProfileDataService
          .likeUser(uid, like_profile_id)
          .then((response) => res.status(200).send(response))
          .catch((error) => {
            res.status(400).send(error.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

userprofile_app.post("/likeFlat/:likedFlatId", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get token from header
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const liked_flat_id = sanitizeHtml(req.params.likedFlatId);
    // Verify token
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        userProfileDataService
          .likeFlat(uid, liked_flat_id)
          .then((response) => res.status(200).send(response))
          .catch((error) => {
            res.status(400).send(error.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// dislike operation/viewed
userprofile_app.post("/dislike/:Id", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get token from header
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const disliked_id = sanitizeHtml(req.params.Id);
    // Verify token
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        return userProfileDataService
          .dislike(uid, disliked_id)
          .then((response) => res.status(200).send(response))
          .catch((error) => {
            res.status(400).send(error.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Add device to user profile (devicePushToken)
userprofile_app.post("/devices/:deviceToken", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get token from header
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const device_token = sanitizeHtml(req.params.deviceToken);

    // Verify token
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        return userProfileDataService
          .addDevice(uid, device_token)
          .then((response) => res.status(200).send(response))
          .catch((error) => {
            res.status(400).send(error.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Remove device from user profile (devicePushToken)
userprofile_app.delete("/devices/:deviceToken", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get token from header
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const device_token = sanitizeHtml(req.params.deviceToken);

    // Verify token
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        return userProfileDataService
          .deleteDevice(uid, device_token)
          .then((response) => res.status(200).send(response))
          .catch((error) => {
            res.status(400).send(error.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Flat Operation

// Get Flat Profiles
flatprofile_app.get("/", async (req, res) => {
  let result;

  result = await flatProfileDataService.getProfilesFromRepo().catch((error) => {
    res.status(400).send(error.message);
  });
  res.status(200).send(result);
});

// Get specific Flat Profile
flatprofile_app.get("/:profileId", async (req, res) => {
  const profile_id = sanitizeHtml(req.params.profileId);
  let result;

  result = await flatProfileDataService
    .getProfileByIdFromRepo(profile_id)
    .catch((error) => {
      if (error.message == "DB entry does not have expected format") {
        res.status(500).send(error.message);
      } else if (error.message == "Flat Profile not found!") {
        res
          .status(404)
          .send("Flat Profile with id " + profile_id + " not found!");
      } else {
        res.status(400).send(error.message);
      }
    });
  res.status(200).send(result);
});

// Create Flat
flatprofile_app.post("/", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        functions.logger.debug("Started Flat Post Request", {
          structuredData: true,
        });
        return flatProfileDataService
          .addFlatProfile(req.body, decodedToken.uid)
          .then((data_service_response) => {
            res.set("Access-Control-Allow-Origin", "*");
            res.status(200).send(data_service_response);
          })
          .catch((e) => {
            // If validation fails return status 400 and list of errors
            if (e.message == "Firebase: Error (auth/email-already-in-use).") {
              // Return HTTP Code 409 if user already exists on Firebase Auth
              res.status(409).send("User already exists!");
            }
            functions.logger.debug(e, { structuredData: true });
            res.status(400).send(e.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Add Room Mate
flatprofile_app.post("/roommate/:mate_email", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const mate_email = sanitizeHtml(req.params.mate_email);
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        functions.logger.debug("Started add roommate Post Request", {
          structuredData: true,
        });
        return flatProfileDataService
          .addUserToFlat(decodedToken.uid, mate_email)
          .then(() => {
            res.set("Access-Control-Allow-Origin", "*");
            res
              .status(200)
              .send(
                "Successfully added the User " + mate_email + " to the flat"
              );
          })
          .catch((e) => {
            functions.logger.debug(e, { structuredData: true });
            res.status(400).send(e.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Leave flat
flatprofile_app.post("/leaveFlat", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        functions.logger.debug("Started Flat Post Request", {
          structuredData: true,
        });
        return flatProfileDataService
          .deleteUserFromFlat(decodedToken.uid)
          .then((data_service_response) => {
            res.set("Access-Control-Allow-Origin", "*");
            res.status(200).send(data_service_response);
          })
          .catch((e) => {
            functions.logger.debug(e, { structuredData: true });
            res.status(400).send(e.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Update Flat
flatprofile_app.patch("/:profileId", async (req, res) => {
  functions.logger.debug("Started Flat Patch Request", {
    structuredData: true,
  });
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get Profile Id and Token from request
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const flat_id = sanitizeHtml(req.params.profileId);

    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        functions.logger.debug("Started Flat Patch Request", {
          structuredData: true,
        });
        // If uid of token matches the profileId continue with request processing
        return flatProfileDataService
          .updateFlat(req.body, flat_id, decodedToken.uid)
          .then((data_service_response) => {
            res.set("Access-Control-Allow-Origin", "*");
            res.status(200).send(data_service_response);
          })
          .catch((e) => {
            // Return HTTP Code 400 if error occurred
            functions.logger.debug(e, { structuredData: true });
            res.status(400).send(e.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Delete Flat
flatprofile_app.delete("/:profileId", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Get token from header
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const profile_id = sanitizeHtml(req.params.profileId);
    // Verify token
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        functions.logger.debug("Started Flat Delete Request", {
          structuredData: true,
        });
        // ToDo get profile id via req.params
        const user_uid = decodedToken.user_id;
        flatProfileDataService
          .deleteFlat(profile_id, user_uid)
          .then((data_service_response) => {
            res.set("Access-Control-Allow-Origin", "*");
            res.status(200).send(data_service_response);
          })
          .catch((e) => {
            // functions.logger.debug(e, {structuredData: true})
            res.status(400).send(e.message);
          });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Discover
discover_app.get("/:quantity", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    let quantity = sanitizeHtml(req.params.quantity);
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        functions.logger.debug("Started discover Request", {
          structuredData: true,
        });
        return assigner.isFlatMate(decodedToken.uid).then((isFlatMate) => {
          if (isFlatMate) {
            functions.logger.debug("user belongs to flat", {
              structuredData: true,
            });
            return flatProfileDataService
              .discover(decodedToken.uid, parseInt(quantity))
              .then((response) => {
                res.status(200).send(response);
              })
              .catch((e) => {
                functions.logger.debug(e, { structuredData: true });
                res.status(404).send(e.message);
              });
          } else {
            functions.logger.debug("user does not belong to flat", {
              structuredData: true,
            });
            return userProfileDataService
              .discover(decodedToken.uid, parseInt(quantity))
              .then((response) => {
                res.status(200).send(response);
              })
              .catch((e) => {
                functions.logger.debug(e, { structuredData: true });
                res.status(404).send(e.message);
              });
          }
        });
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

// Chat
chat_app.post("/:profileId", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    let profileId = sanitizeHtml(req.params.profileId);
    getAuth()
      .verifyIdToken(idToken)
      .then(async (decodedToken) => {
        functions.logger.debug("Started Chat Post Request", {
          structuredData: true,
        });
        try {
          const service_response = await chatservice.createChat(
            profileId,
            decodedToken.uid
          );
          res.set("Access-Control-Allow-Origin", "*");
          res.status(200).send(service_response);
        } catch (e: any) {
          functions.logger.debug(e, { structuredData: true });
          res.status(400).send(e.message);
        }
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});

chat_app.delete("/:chatId", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    let chatId = sanitizeHtml(req.params.chatId);
    getAuth()
      .verifyIdToken(idToken)
      .then(async (decodedToken) => {
        functions.logger.debug("Started Chat Delete Request", {
          structuredData: true,
        });
        try {
          const service_response = await chatservice.deleteChat(
            chatId,
            decodedToken.uid
          );
          res.set("Access-Control-Allow-Origin", "*");
          res.status(200).send(service_response);
        } catch (e: any) {
          functions.logger.debug(e, { structuredData: true });
          res.status(400).send(e.message);
        }
      })
      .catch((error) => {
        res.status(401).send("Authorization failed: " + error);
      });
  } else {
    res
      .status(401)
      .send("Authorization failed: No authorization header present");
  }
});
