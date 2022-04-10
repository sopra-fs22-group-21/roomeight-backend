import { ValidationReport } from "./ValidationReport";
import * as functions from "firebase-functions";

export class Validator {
    static validatePostUser(user_json_body: any) {

        let mandatoryFields = ["firstName", "lastName", "birthday", "email", "phoneNumber", "password"];
        let optionalFields = ["description", "biography", "tags", "pictureReference", "gender", "isSearchingRoom",
                             "isAdvertisingRoom", "moveInDate", "moveOutDate"];
        
        return this.validateFields(user_json_body, mandatoryFields, optionalFields);
    }

    static validatePatchUser(update_fields: any) {
        let mandatoryFields: string[] = [];
        let optionalFields = ["description", "biography", "tags", "pictureReference", "gender", "isSearchingRoom",
                              "isAdvertisingRoom", "moveInDate", "moveOutDate", "firstName", "lastName", "birthday",
                              "phoneNumber", "email", "flatId"];
        return this.validateFields(update_fields, mandatoryFields, optionalFields);
    }

    private static validateFields(user_json_body: any, mandatoryFields: string[], optionalFields: string[]): ValidationReport {
        let report = new ValidationReport();
        let allowedGenders = ["MALE", "FEMALE", "OTHERS", "NOT SET"];

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
            functions.logger.debug("Validate Field" + key, {structuredData: true});
            switch (key) {
                case "password":
                    if (!this.validatePassword(user_json_body[key])) {
                        report.setErrors("invalid Password");
                    }
                    break;
                case "firstName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("invalid FirstName");
                    }
                    break;
                case "lastName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("invalid LastName");
                    }
                    break;
                case "birthday":
                    if (!this.validateBirthday(user_json_body[key])) {
                        report.setErrors("invalid Birthday, Expected Format: 1999-06-22");
                    } else {
                        let today = new Date();
                        today.setHours(0, 0, 0, 0);
                        let birthday = new Date(user_json_body[key]);
                        if (birthday > today) {
                            report.setErrors("invalid birthday: selected date is after today");
                        }
                    }
                    break;
                case "email":
                    if (!this.validateEmail(user_json_body[key])) {
                        report.setErrors("invalid EmailAddress");
                    }
                    break;
                case "phoneNumber":
                    if (!this.validatePhone(user_json_body[key])) {
                        report.setErrors("invalid PhoneNumber");
                    }
                    break;
                case "description":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid Description");
                    }
                    break;
                case "biography":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid Biography");
                    }
                    break;
                case "tags":
                    if (!this.validateTags(user_json_body[key])) {
                        report.setErrors("invalid Tags");
                    }
                    break;
                case "pictureReference":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid PictureReference");
                    }
                    break;
                case "matches":
                    if (!this.validateMatches(user_json_body[key])) {
                        report.setErrors("invalid Matches");
                    }
                    break;
                case "mismatches":
                    if (!this.validateMismatches(user_json_body[key])) {
                        report.setErrors("invalid Mismatches");
                    }
                    break;
                case "gender":
                    if (!this.validateGender(user_json_body[key], allowedGenders)) {
                        report.setErrors("invalid Gender, must be MALE/FEMALE or OTHERS");
                    }
                    break;
                case "isSearchingRoom":
                    if (!this.validateBoolean(user_json_body[key])) {
                        report.setErrors("invalid IsSearchingRoom, has to be true or false (string)");
                    }
                    break;
                case "isAdvertisingRoom":
                    if (!this.validateBoolean(user_json_body[key])) {
                        report.setErrors("invalid IsAdvertisingRoom, has to be true or false (string)");
                    }
                    break;
                case "moveInDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("invalid MoveInDate, Expected Format: 1999-06-22");
                    }
                    break;
                case "moveOutDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("invalid MoveOutDate, Expected Format: 1999-06-22");
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
                case "flatId":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid PictureReference");
                    }
                    continue;
                default:
                    report.setErrors("Unknown Field: " + key);
            }
        }
        return report;
    }
    private static validateBirthday(birthday: string): boolean {
        return (!isNaN(Date.parse(birthday)));
    }
    private static validateGender(gender: string, allowedGenders: string[]): boolean {
        return (allowedGenders.includes(gender) || gender === "");
    }
    private static validateBoolean(bool: string): boolean {
        return (bool === "true" || bool === "false" || bool === "");
    }
    private static validatePhone(phone: string): boolean {
        const regex = new RegExp('^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$');
        return regex.test(phone);
    }
    private static validateEmail(mail: string): boolean {
        let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        return regex.test(mail);
    }
    private static validateDate(date: string): boolean {
        return (!isNaN(Date.parse(date)) || date === "");
    }
    private static validateString(name: string): boolean {
        return (name.length >= 0 && name.length < 300);
    }
    private static validateName(name: string): boolean {
        return (name.length > 0 && name.length < 50);
    }
    private static validatePassword(password: string) {
        return (password.length > 5 && password.length < 50);
    }
    // Todo: validate allowed tags
    private static validateTags(name: string): boolean {
        return (name.length >= 0 && name.length < 100000);
    }
    private static validateMatches(name: string): boolean {
        return (name.length >= 0 && name.length < 100000);
    }
    private static validateMismatches(name: string): boolean {
        return (name.length >= 0 && name.length < 100000);
    }
}


