
export class Validator {
    static validateUser(user: string) {
        let json_body;
        try {
            json_body = JSON.parse(user)
        } catch (e) {
            throw new Error("Body does not have json structure")
        }
        let mandatoryFields = ["FirstName", "LastName", "Birthday", "EmailAddress", "PhoneNumber"];
        for (let field in mandatoryFields) {
            if(!user.hasOwnProperty(field)) {
                return false;
            }
        }

        for (let key in json_body) {
            switch (key) {
                case "FirstName":
                    if (!Validator.validateName(json_body[key])) {
                        return false;
                    }
                    break;
                case "LastName":
                    if (!Validator.validateName(json_body[key])) {
                        return false;
                    }
                    break;
                case "Birthday":
                    if (!Validator.validateBirthday(json_body[key])) {
                        return false;
                    }
                    break;
                case "EmailAddress":
                    if (!Validator.validateEmail(json_body[key])) {
                        return false;
                    }
                    break;
                case "PhoneNumber":
                    if (!Validator.validatePhone(json_body[key])) {
                        return false;
                    }
                    break;
            }
        }
        return true;
    }
    static validatePhone(phone: string): boolean {
        const regex = new RegExp('/(\b(0041|0)|\B\+41)(\s?\(0\))?(\s)?[1-9]{2}(\s)?[0-9]{3}(\s)?[0-9]{2}(\s)?[0-9]{2}\b/');
        return regex.test(phone);
    }
    static validateEmail(mail: string): boolean {
        let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        return regex.test(mail);
    }
    static validateBirthday(birthday: string): boolean {
        return (!isNaN(Date.parse(birthday)));
    }
    static validateName(name: string): boolean {
        return (name === "");
    }
}


