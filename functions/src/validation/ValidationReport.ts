export class ValidationReport {
    hasErrors: boolean;
    errors: Array<string>;

    constructor() {
        this.hasErrors = false;
        this.errors = [];
    }

    setErrors(error: string) {
        this.hasErrors = true;
        this.errors.push(error);
    }
}