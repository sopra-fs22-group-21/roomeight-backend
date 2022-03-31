import * as functions from "firebase-functions";
import {Tag} from "./data-model/Tag";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const test1 = functions.https.onRequest((request, response) => {
  let tag = new Tag("test", "test");
  tag.test();
  response.send("Hello2");
});

