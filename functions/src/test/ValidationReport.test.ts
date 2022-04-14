import {ValidationReport} from "../main/validation/ValidationReport";

describe('ValidatorReport test', () => {
    let validationReport: ValidationReport;

    beforeEach(() => {
        validationReport = new ValidationReport();
    });

    test('new report should not contain errors', () => {
        expect(validationReport.validationFoundErrors()).toBe(false);
    })

    test('report should match the errormessage', () => {
        let errormsg = "Error: test test"
        validationReport.setErrors(errormsg)
        expect(validationReport.validationFoundErrors()).toBe(true);
        expect(validationReport.toString()).toEqual("Errors:\n" + errormsg);
    })
})
