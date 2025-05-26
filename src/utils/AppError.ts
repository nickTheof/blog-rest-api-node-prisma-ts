export class AppError extends Error{
    private readonly code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
    }

    getCode() {
        return this.code;
    }
}