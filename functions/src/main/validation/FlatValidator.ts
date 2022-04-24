import {ValidationReport} from "./ValidationReport";
import * as functions from "firebase-functions";

export class FlatValidator {
    static validatePostUser(user_json_body: any) {
        let mandatoryFields = ["name", "address"];
        let optionalFields = ["description", "biography", "tags", "pictureReference", "likes", "creationDate", "onlineStatus", "moveInDate",
            "moveOutDate", "address", "rent", "permanent", "roomSize", "numberOfBaths", "roomMates", "matches"]
        functions.logger.log(user_json_body);
        return this.validateFields(user_json_body, mandatoryFields, optionalFields);
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
                    if (!this.validateAddress(user_json_body[key])) {
                        report.setErrors("invalid address");
                    }
                    break;
            }
        }
        return report;
    }

    private static validateString(name: string): boolean {
        return (name.length >= 0 && name.length < 300);
    }

    private static validateAddress(address: any): boolean {
        let fields = ["street", "city", "province", "postalCode", "country"];
        for (let i in fields) {
            if(!address.hasOwnProperty(fields[i])) {
                return false;
            }
        }
        for (let key in address) {
            if (!this.validateString(address[key])) {
                return false
            }
        }
        return true;
    }
}


