import {FieldValidator} from "./FieldValidator";

export class UserValidator {
    static validatePostUser(user_json_body: any) {

        let mandatoryFields = ["firstName", "lastName", "birthday", "email", "phoneNumber", "password"];
        let optionalFields = ["description", "biography", "tags", "pictureReferences", "gender",
                              "moveInDate", "moveOutDate", "isComplete"];
        
        return FieldValidator.validateFields(user_json_body, mandatoryFields, optionalFields);
    }

    static validatePatchUser(update_fields: any) {
        let mandatoryFields: string[] = [];
        let optionalFields = ["description", "biography", "tags", "pictureReferences", "gender",
                              "moveInDate", "moveOutDate", "firstName", "lastName", "birthday",
                              "phoneNumber", "email", "flatId", "isComplete", "filters"];
        return FieldValidator.validateFields(update_fields, mandatoryFields, optionalFields);
    }


}


