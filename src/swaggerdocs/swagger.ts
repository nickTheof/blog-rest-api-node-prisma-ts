import {OpenAPIV3} from 'openapi-types';

const swaggerDefinition = {
    openapi: "3.1.0",
    info: {
        version: "1.0.0",
        title: "Blog App CRUD API",
        description:
            "An application for creating users, posts for different categories and creating comments for each post.",
        contact: {
            name: "API Support",
            url: "https://aueb.gr",
            email: "support@example.com",
        },
    }
}

export const swaggerOptions: OpenAPIV3.Document = {
    ...swaggerDefinition,
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local Server",
        },
    ],
    components: {
        schemas: {
            User: {
                type: "object",
                properties: {
                    id: {
                        type: "integer"
                    },
                    email: {
                        type: "string"
                    },
                    password: {
                        type: "string"
                    },
                    role: {
                        type: "string",
                        default: "USER",
                        enum: [
                            "USER",
                            "EDITOR",
                            "ADMIN"
                        ]
                    },
                    isActive: {
                        type: "boolean",
                        default: true
                    },
                    uuid: {
                        type: "string"
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time"
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time"
                    },
                    deletedAt: {
                        type: "string",
                        format: "date-time",
                        nullable: true
                    },
                    profile: {
                        anyOf: [
                            {
                                "$ref": "#/components/schemas/Profile"
                            },
                        ],
                        nullable: true
                    },
                    posts: {
                        type: "array",
                        items: {
                            "$ref": "#/components/schemas/Post"
                        }
                    },
                    comments: {
                        type: "array",
                        items: {
                            "$ref": "#/components/schemas/Comment"
                        }
                    }
                }
            },
            Profile: {
                type: "object",
                properties: {
                    id: {
                        type: "integer"
                    },
                    firstname: {
                        type: "string",
                        nullable: true
                    },
                    lastname: {
                        type: "string",
                        nullable: true
                    },
                    bio: {
                        type: "string"
                    },
                    picUrl: {
                        type: "string",
                        nullable: true
                    },
                    user: {
                        "$ref": "#/components/schemas/User"
                    }
                }
            },
            Post: {
                type: "object",
                properties: {
                    id: {
                        "type": "integer"
                    },
                    title: {
                        "type": "string"
                    },
                    description: {
                        "type": "string"
                    },
                    status: {
                        "type": "string",
                        "default": "DRAFT",
                        "enum": [
                            "PUBLISHED",
                            "DRAFT",
                            "INACTIVE",
                            "ARCHIVED"
                        ]
                    },
                    uuid: {
                        "type": "string"
                    },
                    createdAt: {
                        "type": "string",
                        "format": "date-time"
                    },
                    updatedAt: {
                        "type": "string",
                        "format": "date-time"
                    },
                    author: {
                        "$ref": "#/components/schemas/User"
                    },
                    category: {
                        type: "array",
                        items: {
                            "$ref": "#/components/schemas/Category"
                        }
                    },
                    comments: {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/Comment"
                        }
                    }
                }
            },
            Category: {
                type: "object",
                properties: {
                    "id": {
                        "type": "integer"
                    },
                    "name": {
                        "type": "string"
                    },
                    "posts": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/Post"
                        }
                    }
                }
            },
            Comment: {
                type: "object",
                properties: {
                    id: {
                        type: "integer"
                    },
                    title: {
                        type: "string"
                    },
                    status: {
                        type: "string",
                        default: "ACTIVE",
                        enum: [
                            "ACTIVE",
                            "INACTIVE",
                            "PENDING",
                            "DELETED"
                        ]
                    },
                    uuid: {
                        type: "string"
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time"
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time"
                    },
                    post: {
                        "$ref": "#/components/schemas/Post"
                    },
                    author: {
                        "$ref": "#/components/schemas/User"
                    }
                }
            },
        },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },

    tags: [
        {
            name: "Auth",
            description: "Endpoints for Authentication",
        },
        {
            name: "Users",
            description: "Endpoints for Users",
        },
        {
            name: "Categories",
            description: "Endpoints for Categories",
        },
        {
            name: "Posts",
            description: "Endpoints for Posts",
        },
        {
            name: "Comments",
            description: "Endpoints for Comments",
        }
    ],
    paths: {
        "/api/v1/auth/login": {
            post: {
                tags: ["Auth"],
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
                        description: "Authorization failed",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "error",
                                        },
                                        data: {
                                            type: "string",
                                            example: "Invalid credentials",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/auth/register": {
            post: {
                tags: ["Auth"],
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
                    },
                    400: {
                        description: "Registration failed with validation errors",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "ValidationError",
                                        },
                                        message: {
                                            type: "string",
                                            example: "Invalid input.",
                                        },
                                        errors: {
                                            type: "array",
                                            items: {
                                                type: "string"
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                    409: {
                        description: "Registration failed with conflicts",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "EntityAlreadyExists",
                                        },
                                        message: {
                                            type: "string",
                                            example: "Duplicate entry on unique field.",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }
}
