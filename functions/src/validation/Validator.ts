import { ValidationReport } from "./ValidationReport";

export class Validator {
    static validatePostUser(user_json_body: any) {

        let mandatoryFields = ["FirstName", "LastName", "Birthday", "EmailAddress", "PhoneNumber", "Password"];
        let optionalFields = ["Description", "Biography", "Tags", "PictureReference", "Gender", "IsSearchingRoom",
                             "IsAdvertisingRoom", "MoveInDate", "MoveOutDate"];
        
        return this.validateFields(user_json_body, mandatoryFields, optionalFields);
    }

    static validateFields(user_json_body: any, mandatoryFields: string[], optionalFields: string[]): ValidationReport {
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
            switch (key) {
                case "Password":
                    if (!this.validatePassword(user_json_body[key])) {
                        report.setErrors("invalid Password");
                    }
                    break;
                case "FirstName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("invalid FirstName");
                    }
                    break;
                case "LastName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("invalid LastName");
                    }
                    break;
                case "Birthday":
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
                case "EmailAddress":
                    if (!this.validateEmail(user_json_body[key])) {
                        report.setErrors("invalid EmailAddress");
                    }
                    break;
                case "PhoneNumber":
                    if (!this.validatePhone(user_json_body[key])) {
                        report.setErrors("invalid PhoneNumber");
                    }
                    break;
                case "Description":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid Description");
                    }
                    break;
                case "Biography":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid Biography");
                    }
                    break;
                case "Tags":
                    if (!this.validateTags(user_json_body[key])) {
                        report.setErrors("invalid Tags");
                    }
                    break;
                case "PictureReference":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid PictureReference");
                    }
                    break;
                case "Matches":
                    if (!this.validateMatches(user_json_body[key])) {
                        report.setErrors("invalid Matches");
                    }
                    break;
                case "Mismatches":
                    if (!this.validateMismatches(user_json_body[key])) {
                        report.setErrors("invalid Mismatches");
                    }
                    break;
                case "Gender":
                    if (!this.validateGender(user_json_body[key], allowedGenders)) {
                        report.setErrors("invalid Gender, must be MALE/FEMALE or OTHERS");
                    }
                    break;
                case "IsSearchingRoom":
                    if (!this.validateBoolean(user_json_body[key])) {
                        report.setErrors("invalid IsSearchingRoom, has to be true or false (string)");
                    }
                    break;
                case "IsAdvertisingRoom":
                    if (!this.validateBoolean(user_json_body[key])) {
                        report.setErrors("invalid IsAdvertisingRoom, has to be true or false (string)");
                    }
                    break;
                case "MoveInDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("invalid MoveInDate, Expected Format: 1999-06-22");
                    }
                    break;
                case "MoveOutDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("invalid MoveOutDate, Expected Format: 1999-06-22");
                    } else {
                        if (this.validateDate(user_json_body["MoveOutDate"])) {
                            let moveOutDate = new Date(user_json_body["MoveOutDate"]);
                            let moveInDate = new Date(user_json_body["MoveInDate"]);
                            if (moveInDate > moveOutDate) {
                                report.setErrors("MoveInDate must be before MoveOutDate");
                            }
                        }
                    }
                    break;
                default:
                    if (optionalFields.indexOf(key) == -1) {
                        report.setErrors("Unknown Field: " + key);
                    }
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


