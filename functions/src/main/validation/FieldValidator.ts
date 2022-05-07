import {ValidationReport} from "./ValidationReport";


export class FieldValidator {

    static validateFields(user_json_body: any, mandatoryFields: string[], optionalFields: string[]): ValidationReport {
        let report = new ValidationReport(mandatoryFields, optionalFields);
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
                case "password":
                    if (!this.validatePassword(user_json_body[key])) {
                        report.setErrors("invalid password");
                    }
                    break;
                case "firstName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("invalid firstName");
                    }
                    break;
                case "lastName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("invalid lastName");
                    }
                    break;
                case "birthday":
                    if (!this.validateBirthday(user_json_body[key])) {
                        report.setErrors("invalid birthday, Expected Format: 1999-06-22");
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
                        report.setErrors("invalid email");
                    }
                    break;
                case "phoneNumber":
                    if (!this.validatePhone(user_json_body[key])) {
                        report.setErrors("invalid phoneNumber");
                    }
                    break;
                case "gender":
                    if (!this.validateGender(user_json_body[key], allowedGenders)) {
                        report.setErrors("invalid gender, must be MALE/FEMALE or OTHERS");
                    }
                    break;
                case "isComplete":
                    if (!(typeof user_json_body[key] == "boolean")) {
                        report.setErrors("invalid isComplete, has to be true or false (boolean)");
                    }
                    break;
                case "flatId":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("invalid flatId");
                    }
                    break;
            }
        }
        return report;
    }

    private static validateDate(date: string): boolean {
        return (!isNaN(Date.parse(date)) || date === "");
    }
    private static validateBirthday(birthday: string): boolean {
        return (!isNaN(Date.parse(birthday)));
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
    private static validatePassword(password: string) {
        return (password.length > 5 && password.length < 50);
    }
    private static validateName(name: string): boolean {
        return (name.length > 0 && name.length < 50);
    }
    private static validateGender(gender: string, allowedGenders: string[]): boolean {
        return (allowedGenders.includes(gender) || gender === "");
    }
    private static validatePhone(phone: string): boolean {
        const regex = new RegExp('^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$');
        return regex.test(phone);
    }
    private static validateEmail(mail: string): boolean {
        let regex = new RegExp('[a-z0-9]{1,1000}@[a-z]{1,1000}\.[a-z]{2,3}');
        return regex.test(mail);
    }

}
