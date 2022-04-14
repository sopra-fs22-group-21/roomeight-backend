
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

    toString(): string {
        let error_str = "Errors:\n"
        for(let index in this.errors) {
            if (index == (this.errors.length-1).toString()) {
                error_str += this.errors[index];
            } else {
                error_str += this.errors[index] + ", \n";
            }
        }
        return error_str;
    }
}
