export class FirestoreError extends Error {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, FirestoreError.prototype);
    }
}
