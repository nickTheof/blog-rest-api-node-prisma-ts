export interface ErrorResponse {
    status: string;
    message: string;
    errors: string[];
    stack?: string;
}

export function buildErrorResponse({
                                       status,
                                       message,
                                       errors = [],
                                       stack,
                                   }: Partial<ErrorResponse> & { status: string; message: string }): ErrorResponse {
    const response: ErrorResponse = {
        status,
        message,
        errors,
    };

    if (process.env.NODE_ENV === 'development' && stack) {
        response.stack = stack;
    }

    return response;
}
