import * as functions from "firebase-functions";
import {FieldValidator} from "./FieldValidator";

export class FlatValidator {
    static validatePostFlat(user_json_body: any) {
        let mandatoryFields = ["name", "address"];
        let optionalFields = ["description", "biography", "tags", "pictureReferences", "onlineStatus", "moveInDate",
            "moveOutDate", "rent", "permanent", "roomSize", "numberOfBaths", "numberOfRoommates", "addressCoordinates"]
        functions.logger.log(user_json_body);
        return FieldValidator.validateFields(user_json_body, mandatoryFields, optionalFields);
    }

    static validatePatchFlat(update_fields: any) {
        let mandatoryFields: string[] = [];
        let optionalFields = ["description", "biography", "tags", "pictureReferences", "onlineStatus", "moveInDate",
            "moveOutDate", "rent", "permanent", "roomSize", "numberOfBaths", "numberOfRoommates", "name", "address",
            "addressCoordinates"];
        return FieldValidator.validateFields(update_fields, mandatoryFields, optionalFields);
    }

}


