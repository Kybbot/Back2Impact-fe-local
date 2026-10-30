export class ApiError extends Error {
    public status: number;

    constructor(
        status: number,
        message?: string
    ) {
        super(message);

        this.name = 'ApiError';
        this.status = status;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}