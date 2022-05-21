import {ValidationReport} from "./ValidationReport";
import {Tag} from "../data-model/Tag";


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
                        report.setErrors("Invalid name: Should be of type string and have less than 300 signs");
                    }
                    break;
                case "address":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("Invalid address: Should be of type string and have less than 300 signs");
                    }
                    break;
                case "description":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("Invalid description: Should be of type string and have less than 300 signs");
                    }
                    break;
                case "biography":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("Invalid biography: Should be of type string and have less than 300 signs");
                    }
                    break;
                case "tags":
                    if (!this.validateStringArray(user_json_body[key])) {
                        report.setErrors("Invalid tags: Should be a string array");
                    } else {
                        for(let tag of user_json_body[key]) {
                            if (!this.validateTag(tag)) {
                                report.setErrors("Invalid tag: " + tag + " is not a valid tag. Valid tags are: " + Object.values(Tag).toString());
                            }
                        }
                    }
                    break;
                case "pictureReferences":
                    if (!this.validateStringArray(user_json_body[key])) {
                        report.setErrors("invalid pictureReferences: Should be an array of strings");
                    }
                    break;
                case "permanent":
                    if (!(this.validateBoolean(user_json_body[key]))) {
                        report.setErrors("Invalid permanent: Has to be true or false (boolean)");
                    }
                    break;
                case "moveInDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("Invalid moveInDate: Expected Format: 1999-06-22");
                    }
                    break;
                case "moveOutDate":
                    if (!this.validateDate(user_json_body[key])) {
                        report.setErrors("Invalid moveOutDate: Expected Format: 1999-06-22");
                    } else {
                        if (!user_json_body.hasOwnProperty("moveInDate")) {
                            break;
                        }
                        if (this.validateDate(user_json_body["moveInDate"])) {
                            let moveOutDate = new Date(user_json_body["moveOutDate"]);
                            let moveInDate = new Date(user_json_body["moveInDate"]);
                            if (moveInDate > moveOutDate) {
                                report.setErrors("Invalid moveOutDate: moveInDate must be before moveOutDate");
                            }
                        }
                    }
                    break;
                case "password":
                    if (!this.validatePassword(user_json_body[key])) {
                        report.setErrors("Invalid password: Should be of type string and have between 5 and 50 characters");
                    }
                    break;
                case "firstName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("Invalid firstName");
                    }
                    break;
                case "lastName":
                    if (!this.validateName(user_json_body[key])) {
                        report.setErrors("Invalid lastName");
                    }
                    break;
                case "birthday":
                    if (!this.validateBirthday(user_json_body[key])) {
                        report.setErrors("Invalid birthday, Expected Format: 1999-06-22");
                    } else {
                        let today = new Date();
                        today.setHours(0, 0, 0, 0);
                        let birthday = new Date(user_json_body[key]);
                        if (birthday > today) {
                            report.setErrors("Invalid birthday: selected date is after today");
                        }
                    }
                    break;
                case "email":
                    if (!this.validateEmail(user_json_body[key])) {
                        report.setErrors("Invalid email");
                    }
                    break;
                case "phoneNumber":
                    if (!this.validatePhone(user_json_body[key])) {
                        report.setErrors("Invalid phoneNumber");
                    }
                    break;
                case "gender":
                    if (!this.validateGender(user_json_body[key], allowedGenders)) {
                        report.setErrors("Invalid gender, must be MALE/FEMALE or OTHERS");
                    }
                    break;
                case "isComplete":
                    if (typeof user_json_body[key] != "boolean") {
                        report.setErrors("Invalid isComplete, has to be true or false (boolean)");
                    }
                    break;
                case "flatId":
                    if (!this.validateString(user_json_body[key])) {
                        report.setErrors("Invalid flatId");
                    }
                    break;
                case "rent":
                    if(!this.validateNumber(user_json_body[key])) {
                        report.setErrors("Invalid rent: Should be of type number")
                    }
                    break;
                case "numberOfRoomMates":
                    if(!this.validateNumber(user_json_body[key])) {
                        report.setErrors("Invalid numberOfRoomMates: Should be of type number")
                    }
                    break;
                case "roomSize":
                    if(!this.validateNumber(user_json_body[key])) {
                        report.setErrors("Invalid roomSize: Should be of type number")
                    }
                    break;
                case "numberOfBaths":
                    if(!this.validateNumber(user_json_body[key])) {
                        report.setErrors("Invalid numberOfBaths: Should be of type number")
                    }
                    break;
                case "addressCoordinates":
                    if (!this.validateCoordinates(user_json_body[key])) {
                        report.setErrors("Invalid addressCoordinates: Should contain latitude and longitude, both of type number");
                    }
                    break;
                case "filters":
                    const filters = user_json_body[key];
                    try {
                        for(let element in filters) {
                            switch (element) {
                                case "age":
                                    if (filters[element].hasOwnProperty("min")){
                                        if(!this.validateNumber(filters[element]["min"])) {
                                            report.setErrors("Invalid Filter Age min: Should be of type number")
                                        }
                                    }
                                    if (filters[element].hasOwnProperty("max")){
                                        if(!this.validateNumber(filters[element]["max"])) {
                                            report.setErrors("Invalid Filter Age max: Should be of type number")
                                        }
                                    }
                                    break;
                                case "gender":
                                    if(!this.validateGender(filters[element], allowedGenders)) {
                                        report.setErrors("Invalid Filter Gender: Allowed values" + allowedGenders)
                                    }
                                    break;
                                case "tags":
                                    if (!this.validateStringArray(filters[element])) {
                                        report.setErrors("Invalid Filter tags: Should be a string array");
                                    } else {
                                        for(let tag of filters[element]) {
                                            if (!this.validateTag(tag)) {
                                                report.setErrors("Invalid Filter tag: " + tag + " is not a valid tag. Valid tags are: " + Object.values(Tag).toString())
                                            }
                                        }
                                    }
                                    break;
                                case "rent":
                                    if (filters[element].hasOwnProperty("min")){
                                        if(!this.validateNumber(filters[element]["min"])) {
                                            report.setErrors("Invalid Filter rent min: Should be of type number and positive")
                                        }
                                    }
                                    if (filters[element].hasOwnProperty("max")){
                                        if(!this.validateNumber(filters[element]["max"])) {
                                            report.setErrors("Invalid Filter rent max: Should be of type number and positive")
                                        }
                                    }
                                    break;
                                case "permanent":
                                    if (!(this.validateBoolean(filters[element]))) {
                                        report.setErrors("Invalid filter permanent: has to be true, false (boolean) or null");
                                    }
                                    break;
                                case "matchingTimeRange":
                                    if (!(this.validateBoolean(filters[element]))) {
                                        report.setErrors("Invalid filter matchingTimeRange: has to be true or false (boolean)");
                                    }
                                    break;
                                case "numberOfRoomMates":
                                    if (filters[element].hasOwnProperty("min")){
                                        if(!this.validateNumber(filters[element]["min"])) {
                                            report.setErrors("Invalid Filter numberOfRoomMates min: Should be of type number and positive")
                                        }
                                    }
                                    if (filters[element].hasOwnProperty("max")){
                                        if(!this.validateNumber(filters[element]["max"])) {
                                            report.setErrors("Invalid Filter numberOfRoomMates max: Should be of type number and positive")
                                        }
                                    }
                                    break;
                                case "roomSize":
                                    if (filters[element].hasOwnProperty("min")){
                                        if(!this.validateNumber(filters[element]["min"])) {
                                            report.setErrors("Invalid Filter roomSize min: Should be of type number and positive")
                                        }
                                    }
                                    if (filters[element].hasOwnProperty("max")){
                                        if(!this.validateNumber(filters[element]["max"])) {
                                            report.setErrors("Invalid Filter roomSize max: Should be of type number and positive")
                                        }
                                    }
                                    break;
                                case "numberOfBaths":
                                    if (filters[element].hasOwnProperty("min")){
                                        if(!this.validateNumber(filters[element]["min"])) {
                                            report.setErrors("Invalid Filter numberOfBaths min: Should be of type number and positive")
                                        }
                                    }
                                    if (filters[element].hasOwnProperty("max")){
                                        if(!this.validateNumber(filters[element]["max"])) {
                                            report.setErrors("Invalid Filter numberOfBaths max: Should be of type number and positive")
                                        }
                                    }
                                    break;
                            }
                        }
                    } catch (e) {
                        console.log(e);
                        report.setErrors("Invalid filters: Filters must be of type map")
                    }
            }
        }
        return report;
    }

    private static validateDate(date: any): boolean {
        if (typeof date != "string") {
            return false;
        }
        return (!isNaN(Date.parse(date)) || date === "");
    }

    private static validateBirthday(birthday: any): boolean {
        if (typeof birthday != "string") {
            return false;
        }
        return (!isNaN(Date.parse(birthday)));
    }

    private static validateString(name: any): boolean {
        return (name.length >= 0 && name.length < 300 && typeof name == "string");
    }

    private static validateTag(tag: any): boolean {
        if (typeof tag != "string") {
            return false;
        }
        return Object.values(Tag).includes(tag as Tag);
    }

    private static validateStringArray(str_array: any): boolean {
        if(Object.prototype.toString.call(str_array) !== '[object Array]') {
            return false;
        }
        let bool = true;
        for (let element of str_array) {
            if (!this.validateString(element)) {
                bool = false;
            }
        }
        return bool;
    }

    private static validatePassword(password: any) {
        return (typeof password == "string" && password.length > 5 && password.length < 50);
    }

    private static validateName(name: any): boolean {
        return (typeof name == "string" && name.length > 0 && name.length < 50);
    }

    private static validateGender(gender: any, allowedGenders: string[]): boolean {
        return (typeof gender == "string" && allowedGenders.includes(gender) || gender === "");
    }

    private static validatePhone(phone: any): boolean {
        if (typeof phone != "string") {
            return false;
        }
        const regex = new RegExp('^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$');
        return regex.test(phone);
    }

    private static validateEmail(mail: any): boolean {
        if (typeof mail != "string") {
            return false;
        }
        let regex = new RegExp('[a-z0-9]{1,1000}@[a-z]{1,1000}\.[a-z]{2,3}');
        return regex.test(mail);
    }

    private static validateBoolean(bool: any): boolean {
        return typeof bool == "boolean" || bool == null;
    }

    private static validateNumber(nr: any): boolean {
        return typeof nr == "number" && nr >= 0;
    }

    private static validateCoordinates(coordinates: any): boolean {
        return typeof coordinates.latitude == "number" && typeof coordinates.longitude == "number";
    }
}
