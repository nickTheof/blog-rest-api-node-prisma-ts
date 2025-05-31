import {OpenAPIV3} from "openapi-types";
import {
    RefModels,
    responserError400Validation,
    responserError409Conflict,
    successOKSchema
} from "../helpers/responses.swagger";

export const authSwaggerPaths: OpenAPIV3.PathsObject = {
    "/api/v1/auth/login": {
        post: {
            tags: ["Authentication"],
            summary: "Login local user",
            description: "Login user",
            security: [],
            requestBody: {
                description:
                    "User sends email and password, receives JWT token in response",
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["email", "password"],
                            properties: {
                                email: { type: "string", example: "test@mail.com" },
                                password: { type: "string", example: "12345" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Token returned",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: {
                                        type: "string",
                                        example: "success",
                                    },
                                    token: {
                                        type: "string",
                                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                    },
                                },
                            },
                        },
                    },
                },
                401: {
                    description: "Invalid credentials",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: {
                                        type: "string",
                                        example: "error",
                                    },
                                    message: {
                                        type: "string",
                                        example: "Invalid credentials",
                                    },
                                }
                            }
                        }
                    }
                }
            }
        },
    },
    "/api/v1/auth/register": {
        post: {
            tags: ["Authentication"],
            summary: "Local registration of a user.",
            description: "Register a local user with role USER.",
            security: [],
            requestBody: {
                description:
                    "User sends email, password, confirmation password and receives JWT token in response",
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["email", "password", "confirmPassword"],
                            properties: {
                                email: { type: "string", example: "test@mail.com" },
                                password: { type: "string", example: "aA!12345" },
                                confirmPassword: { type: "string", example: "aA!12345" },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Successful local registration of a user",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.USER)
                            }
                        }
                    }
                ,
                400: responserError400Validation("Registration failed with invalid data"),
                409:responserError409Conflict("User"),
            },
        },
    },
}