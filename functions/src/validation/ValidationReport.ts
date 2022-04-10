
export class ValidationReport {
    private hasErrors: boolean;
    private errors: string[];

    constructor() {
        this.hasErrors = false;
        this.errors = [];
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

    toString(): any {
        let error_str = "Errors:\n"
        for(let index in this.errors) {
            error_str += this.errors[index] + ", \n";
        }
        return error_str;
    }
}
