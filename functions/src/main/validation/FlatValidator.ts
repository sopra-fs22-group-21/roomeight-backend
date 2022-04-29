import {ValidationReport} from "./ValidationReport";
import * as functions from "firebase-functions";

export class FlatValidator {
    static validatePostFlat(user_json_body: any) {
        let mandatoryFields = ["name", "address"];
        let optionalFields = ["description", "biography", "tags", "pictureReferences", "likes", "onlineStatus", "moveInDate",
            "moveOutDate", "address", "rent", "permanent", "roomSize", "numberOfBaths", "roomMates", "matches"]
        functions.logger.log(user_json_body);
        return this.validateFields(user_json_body, mandatoryFields, optionalFields);
    }

    static validatePatchFlat(update_fields: any) {
        let mandatoryFields: string[] = [];
        let optionalFields = ["description", "biography", "tags", "pictureReferences", "roomSize",
            "rent", "permanent", "numberOfRoommates", "numberOfBaths", "moveInDate", "moveOutDate", "name", "address", "roomMates", "matches", "onlineStatus"];
        return this.validateFields(update_fields, mandatoryFields, optionalFields);
    }

    private static validateFields(user_json_body: any, mandatoryFields: string[], optionalFields: string[]): ValidationReport {
        let report = new ValidationReport(mandatoryFields, optionalFields);

        for (let i in mandatoryFields) {
            if(!user_json_body.hasOwnProperty(mandatoryFields[i])) {
                report.setErrors("JSON object does not contain required field: " + mandatoryFields[i]);
            }
        }

        for (let key in user_json_body) {
            if (user_json_body[key] === null) {
                report.setErrors("" + key + " is null");
                continue;
            }
            if (optionalFields.indexOf(key) == -1 && mandatoryFields.indexOf(key) == -1) {
                report.setErrors("Unknown Field: " + key);
                continue;
            }

            switch (key) {
                case "name":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid name");
                    }
                    break;
                case "address":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid address");
                    }
                    break;
                case "description":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid description");
                    }
                    break;
                case "biography":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid biography");
                    }
                    break;
                case "tags":
                    // ToDo validate allowed tags
                    if (!this.validateStringArray(user_json_body[key])) {
                        report.setErrors("invalid tags");
                    }
                    break;
                case "pictureReferences":
                    if (!this.validateStringArray(user_json_body[key])) {
                        report.setErrors("invalid pictureReferences");
                    }
                    break;
                case "permanent":
                    if (!(typeof user_json_body[key] == "boolean")) {
                        report.setErrors("invalid isSearchingRoom, has to be true or false (boolean)");
                    }
                    break;
                case "moveInDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("invalid moveInDate, Expected Format: 1999-06-22");
                    }
                    break;
                case "moveOutDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("invalid moveOutDate, Expected Format: 1999-06-22");
                    } else {
                        // Todo: improve field validation -> MoveIn date not always in body
                        if (!user_json_body.hasOwnProperty("moveInDate")) {
                            break;
                        }
                        if (this.validateDate(user_json_body["moveInDate"])) {
                            let moveOutDate = new Date(user_json_body["moveOutDate"]);
                            let moveInDate = new Date(user_json_body["moveInDate"]);
                            if (moveInDate > moveOutDate) {
                                report.setErrors("moveInDate must be before moveOutDate");
                            }
                        }
                    }
                    break;
            }
        }
        return report;
    }

    private static validateDate(date: string): boolean {
        return (!isNaN(Date.parse(date)) || date === "");
    }
    private static validateString(name: string): boolean {
        return (name.length >= 0 && name.length < 300);
    }
    // Todo: validate allowed tags
    // private static validateTags(name: string): boolean {
    //     return (name.length >= 0 && name.length < 100000);
    // }
    private static validateStringArray(references: string[]): boolean {
        let bool = true;
        for (let reference of references) {
            if (!this.validateString(reference)) {
                bool = false;
            }
        }
        return bool;
    }
}


