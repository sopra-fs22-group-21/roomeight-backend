
export class ValidationReport {
    private hasErrors: boolean;
    private errors: string[];
    private mandatoryFields: string[];
    private optionalFields: string[];

    constructor(mandatoryFields: string[], optionalFields: string[]) {
        this.hasErrors = false;
        this.errors = [];
        this.mandatoryFields = mandatoryFields;
        this.optionalFields = optionalFields;
    }

    setErrors(error: string) {
        if (!this.hasErrors) {
            this.hasErrors = true;
        }
        this.errors.push(error);
    }

    validationFoundErrors(): boolean {
        return this.hasErrors;
    }

    toString(): string {
        let error_str = "Errors:\n"
        for(let index in this.errors) {
            if (index == (this.errors.length-1).toString()) {
                error_str += this.errors[index] + "\n";
            } else {
                error_str += this.errors[index] + ",\n";
            }
        }
        error_str += "Mandatory fields are: " + this.mandatoryFields + "\n";
        error_str += "Optional fields are: " + this.optionalFields;
        return error_str;
    }
}
