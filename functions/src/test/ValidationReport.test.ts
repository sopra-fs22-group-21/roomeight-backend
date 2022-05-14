import {ValidationReport} from "../main/validation/ValidationReport";

describe('ValidatorReport test', () => {
    let validationReport: ValidationReport;
    let mandatoryFields = ["firstName", "lastName", "birthday", "email", "phoneNumber", "password"];
    let optionalFields = ["description", "biography", "tags", "pictureReferences", "gender", "isSearchingRoom",
        "isAdvertisingRoom", "moveInDate", "moveOutDate"];

    beforeEach(() => {
        validationReport = new ValidationReport(mandatoryFields, optionalFields);
    });

    test('1 Test new report should not contain errors', () => {
        expect(validationReport.validationFoundErrors()).toBe(false);
    })

    test('2 Test report should match the errormessage', () => {
        let errormsg = "Error: test test\n" +
            "Mandatory fields are: firstName,lastName,birthday,email,phoneNumber,password\n" +
            "Optional fields are: description,biography,tags,pictureReferences,gender,isSearchingRoom,isAdvertisingRoom,moveInDate,moveOutDate"
        validationReport.setErrors("Error: test test")
        expect(validationReport.validationFoundErrors()).toBe(true);
        expect(validationReport.toString()).toEqual("Errors:\n" + errormsg);
    })
})
