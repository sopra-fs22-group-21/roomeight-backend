import { ValidationReport } from "./ValidationReport";

export class Validator {
    static validateUser(user_json_body: any) {
        let report = new ValidationReport();

        let mandatoryFields = ["FirstName", "LastName", "Birthday", "EmailAddress", "PhoneNumber", "Password"];
        let optionalFields = ["Description", "Biography", "Tags", "PictureReference", "Matches", "OnlineStatus",
                              "Gender", "IsSearchingRoom", "IsAdvertisingRoom", "MoveInDate", "MoveOutDate"]
        for (let i in mandatoryFields) {
            if(!user_json_body.hasOwnProperty(mandatoryFields[i])) {
                report.setErrors("JSON object does not contain required field: " + mandatoryFields[i]);
            }
        }

        console.log(user_json_body)
        for (let key in user_json_body) {
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
                        report.setErrors("invalid Birthday");
                    }
                    break;
                case "EmailAddress":
                    if (!this.validateEmail(user_json_body[key])) {
                        report.setErrors("invalid EmailAddress, Expected Format: 1999-06-22");
                    }
                    break;
                case "PhoneNumber":
                    if (!this.validatePhone(user_json_body[key])) {
                        report.setErrors("invalid PhoneNumber");
                    }
                    break;
                default:
                    // Todo validate optional fields
                    if (optionalFields.indexOf(key) == -1) {
                        report.setErrors("Unknown Field: " + key);
                    }
            }
        }
        return report;
    }
    private static validatePhone(phone: string): boolean {
        const regex = new RegExp('/(\b(0041|0)|\B\+41)(\s?\(0\))?(\s)?[1-9]{2}(\s)?[0-9]{3}(\s)?[0-9]{2}(\s)?[0-9]{2}\b/');
        return regex.test(phone);
    }
    private static validateEmail(mail: string): boolean {
        let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        return regex.test(mail);
    }
    private static validateBirthday(birthday: string): boolean {
        return (!isNaN(Date.parse(birthday)));
    }
    private static validateName(name: string): boolean {
        return (name.length > 1 && name.length < 50);
    }

    private static validatePassword(password: string) {
        return (password.length > 5 && password.length < 50);
    }
}


