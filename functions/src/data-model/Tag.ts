import * as functions from "firebase-functions";

export class Tag implements Profile {
    description: string;
    name: string;

    constructor(name: string, description: string) {
        this.description = description;
        this.name = name;
    }

    test(): void {
        functions.logger.info("Hello from tag!", {structuredData: true});
    }

}
