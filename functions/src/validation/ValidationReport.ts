export class ValidationReport {
    private hasErrors: boolean;
    private errors: Array<string>;

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

    toJson(): any {
        return {
            errors: this.errors
        }
    }
}
