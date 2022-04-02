import { ValidationReport } from "./ValidationReport";

export class Validator {
    static validateUser(user: string) {
        let json_body;
        try {
            json_body = JSON.parse(user)
        } catch (e) {
            throw new Error("Body does not have json structure")
        }
        let report = new ValidationReport();

        let mandatoryFields = ["FirstName", "LastName", "Birthday", "EmailAddress", "PhoneNumber", "Password"];
        for (let field in mandatoryFields) {
            if(!user.hasOwnProperty(field)) {
                report.setErrors("JSON object does not contain required field: " + field);
            }
        }

        for (let key in json_body) {
            switch (key) {
                case "Password":
                    if (!Validator.validatePassword(json_body[key])) {
                        report.setErrors("invalid Password");
                    }
                case "FirstName":
                    if (!Validator.validateName(json_body[key])) {
                        report.setErrors("invalid FirstName");
                    }
                    break;
                case "LastName":
                    if (!Validator.validateName(json_body[key])) {
                        report.setErrors("invalid LastName");
                    }
                    break;
                case "Birthday":
                    if (!Validator.validateBirthday(json_body[key])) {
                        report.setErrors("invalid Birthday");
                    }
                    break;
                case "EmailAddress":
                    if (!Validator.validateEmail(json_body[key])) {
                        report.setErrors("invalid EmailAddress");
                    }
                    break;
                case "PhoneNumber":
                    if (!Validator.validatePhone(json_body[key])) {
                        report.setErrors("invalid PhoneNumebr");
                    }
                    break;
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


