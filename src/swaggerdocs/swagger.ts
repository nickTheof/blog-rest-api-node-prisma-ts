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
            name: "Categories",
            description: "Endpoints for Categories",
        },
        {
            name: "Comments",
            description: "Endpoints for Comments",
        },
        {
            name: "Posts",
            description: "Endpoints for Posts",
        },
        {
            name: "Profiles",
            description: "Endpoints for Profiles",
        },
        {
            name: "Users",
            description: "Endpoints for Users",
        },
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
        "/api/v1/categories": {
            get: {
                tags: ["Categories"],
                summary: "Get all categories in a list",
                description:
                    "Returns a list of all categories, optionally paginated.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "paginated",
                        in: "query",
                        description: "Set to true to paginate results.",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["true", "false"],
                            default: "false"
                        }
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Page number (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "1"
                        }
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Number of results per page (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "50"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "List of all categories or paginated categories",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                results: { "type": "integer", "example": 2 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Category" }
                                                }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                totalItems: { "type": "integer", "example": 16 },
                                                totalPages: { "type": "integer", "example": 4 },
                                                currentPage: { "type": "integer", "example": 1 },
                                                limit: { "type": "integer", "example": 5 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Category" }
                                                }
                                            }
                                        }
                                    ]
                                },
                                examples: {
                                    nonPaginated: {
                                        summary: "Non-paginated list",
                                        value: {
                                            status: "success",
                                            results: 2,
                                            data: [
                                                { "id": 1, "name": "Category A" },
                                                { "id": 2, "name": "Category B" }
                                            ]
                                        }
                                    },
                                    paginated: {
                                        summary: "Paginated list",
                                        value: {
                                            status: "success",
                                            totalItems: 16,
                                            totalPages: 4,
                                            currentPage: 1,
                                            limit: 5,
                                            data: [
                                                { "id": 1, "name": "Category A" }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: "Invalid Query Parameters",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Categories"],
                summary: "Create a new category. Admin - Editor action",
                description:
                    "Returns a new created Category. Require an authenticated user with admin or editor role",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    description: "JSON with category data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description:
                            "JSON response of a successful creation of a new category",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Category",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: "Invalid request body data",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin - editor authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    409: {
                        description: "Category already exists",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityAlreadyExists",
                                    message: "Duplicate entry on unique field.",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/categories/{id}": {
            get: {
                tags: ["Categories"],
                summary: "Retrieve a category by its ID",
                description: "Fetches the details of a specific category using its unique identifier. Returns a 404 error if the category does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the category to find",
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    200: {
                        description: "Category by id",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Category",
                                        }
                                    }
                                },
                            },
                        }
                    },
                    400: {
                        description: "Invalid Category ID",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Category Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Category with id: 1 not found",
                                },
                            },
                        },
                    },
                }
            },
            patch: {
                tags: ["Categories"],
                summary: "Update a category by its ID. Admin - Editor action.",
                description: "Updates the properties of a specific category identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN or EDITOR roles are authorized. Returns a 404 error if the category does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the category to update",
                        schema: { type: "integer" },
                    },
                ],
                requestBody: {
                    description: "JSON with the updated category data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description:
                            "JSON response of a successful update of the category",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Category",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: "Invalid request body data",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin or editor authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Category Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Category with id: 1 not found",
                                },
                            },
                        },
                    },
                    409: {
                        description: "Category already exists",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityAlreadyExists",
                                    message: "Duplicate entry on unique field.",
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Categories"],
                summary: "Delete a category by its ID. Admin - Editor action",
                description: "Permanently deletes the specified category from the database using its unique ID. Only users with ADMIN or EDITOR roles are authorized. Returns a 204 No Content status if successful or a 404 error if the category does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the category to find",
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    204: {
                        description:
                            "Category deleted successfully. No content is returned.",
                    },
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin or editor authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Category Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Category with id: 1 not found",
                                },
                            },
                        },
                    },
                },
            }
        },
        "/api/v1/users":{

        },
        "/api/v1/profiles": {
            get: {
                tags: ["Profiles"],
                summary: "Get all profiles in a list. Admin Action",
                description:
                    "Returns a list of all profiles, optionally paginated.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "paginated",
                        in: "query",
                        description: "Set to true to paginate results.",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["true", "false"],
                            default: "false"
                        }
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Page number (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "1"
                        }
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Number of results per page (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "50"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "List of all profiles or paginated profiles",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                results: { "type": "integer", "example": 2 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Profile" }
                                                }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                totalItems: { "type": "integer", "example": 16 },
                                                totalPages: { "type": "integer", "example": 4 },
                                                currentPage: { "type": "integer", "example": 1 },
                                                limit: { "type": "integer", "example": 5 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Profile" }
                                                }
                                            }
                                        }
                                    ]
                                },
                                examples: {
                                    nonPaginated: {
                                        summary: "Non-paginated list",
                                        value: {
                                            status: "success",
                                            results: 2,
                                            data: [
                                                { "id": 1,
                                                    "firstname": "John",
                                                    "lastname": "Doe",
                                                    "bio": "Software developer and tech enthusiast.",
                                                    "picUrl": "https://example.com/images/profile1.jpg",
                                                    "user": {
                                                        "id": 1,
                                                        "email": "john.doe@example.com",
                                                        "password": "hashed_password_here",
                                                        "role": "USER",
                                                        "isActive": true,
                                                        "uuid": "e4d1a9c2-efb2-489b-b627-23eb7e167c33",
                                                        "createdAt": "2024-05-29T12:00:00Z",
                                                        "updatedAt": "2024-05-29T12:00:00Z",
                                                        "deletedAt": null,
                                                        "profile": null,
                                                        "posts": [],
                                                        "comments": []
                                                    }
                                                    },
                                                { "id": 2,
                                                    "firstname": null,
                                                    "lastname": null,
                                                    "bio": "Just another user.",
                                                    "picUrl": null,
                                                    "user": {
                                                        "id": 2,
                                                        "email": "user2@example.com",
                                                        "password": "hashed_pw",
                                                        "role": "USER",
                                                        "isActive": true,
                                                        "uuid": "b7e5ac34-1e43-4138-a843-8b2a45ab1d44",
                                                        "createdAt": "2024-05-29T12:00:00Z",
                                                        "updatedAt": "2024-05-29T12:00:00Z",
                                                        "deletedAt": null,
                                                        "profile": null,
                                                        "posts": [],
                                                        "comments": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    paginated: {
                                        summary: "Paginated list",
                                        value: {
                                            status: "success",
                                            totalItems: 16,
                                            totalPages: 4,
                                            currentPage: 1,
                                            limit: 5,
                                            data: [
                                                { "id": 1,
                                                    "firstname": "John",
                                                    "lastname": "Doe",
                                                    "bio": "Software developer and tech enthusiast.",
                                                    "picUrl": "https://example.com/images/profile1.jpg",
                                                    "user": {
                                                        "id": 1,
                                                        "email": "john.doe@example.com",
                                                        "password": "hashed_password_here",
                                                        "role": "USER",
                                                        "isActive": true,
                                                        "uuid": "e4d1a9c2-efb2-489b-b627-23eb7e167c33",
                                                        "createdAt": "2024-05-29T12:00:00Z",
                                                        "updatedAt": "2024-05-29T12:00:00Z",
                                                        "deletedAt": null,
                                                        "profile": null,
                                                        "posts": [],
                                                        "comments": []
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: "Invalid Query Parameters",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/profiles/{id}": {
            get: {
                tags: ["Profiles"],
                summary: "Retrieve a profile by its ID",
                description: "Fetches the details of a specific profile using its unique identifier. Returns a 404 error if the profile does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the profile to find",
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    200: {
                        description: "Profile by id",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Profile",
                                        }
                                    }
                                },
                            },
                        }
                    },
                    400: {
                        description: "Invalid Profile ID",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Profile Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Profile with id: 1 not found",
                                },
                            },
                        },
                    },
                }
            },
            patch: {
                tags: ["Profiles"],
                summary: "Update a profile by its ID. Admin action",
                description: "Updates the properties of a specific profile identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the profile does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the profile to find",
                        schema: { type: "integer" },
                    },
                ],
                requestBody: {
                    description: "JSON with profile data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["bio"],
                                properties: {
                                    firstname: { type: "string" },
                                    lastname: { type: "string" },
                                    bio: { type: "string" },
                                    picUrl: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Successful Update Profile by id",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Profile",
                                        }
                                    }
                                },
                            },
                        }
                    },
                    400: {
                        description: "Invalid Profile ID",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Profile Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Profile with id: 1 not found",
                                },
                            },
                        },
                    },
                }
            },
            delete: {
                tags: ["Profiles"],
                summary: "Delete a profile by its ID. Admin action",
                description: "Permanently deletes the specified profile from the database using its unique ID. Only users with ADMIN role are authorized. Returns a 204 No Content status if successful or a 404 error if the profile does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the profile to find",
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    204: {
                        description:
                            "Profile deleted successfully. No content is returned.",
                    },
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Profile Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Profile with id: 1 not found",
                                },
                            },
                        },
                    },
                }
            }
        },
        "/api/v1/comments": {
            get: {
                tags: ["Comments"],
                summary: "Get all comments in a list. Admin Action",
                description:
                    "Returns a list of all comments, optionally paginated. Support filtering by comment status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "status",
                        in: "query",
                        description: "Filter by one or more comment status values. You can repeat the parameter (?status=ACTIVE&status=INACTIVE) or provide a single value.",
                        required: false,
                        style: "form",
                        explode: true,
                        schema: {
                            type: "array",
                            items: {
                                type: "string",
                                enum: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
                            },
                        },
                        example: ["ACTIVE", "INACTIVE"],
                    },
                    {
                        name: "paginated",
                        in: "query",
                        description: "Set to true to paginate results.",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["true", "false"],
                            default: "false"
                        }
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Page number (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "1"
                        }
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Number of results per page (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "50"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "List of all comments or paginated comments with optional filters",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                results: { "type": "integer", "example": 2 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Comment" }
                                                }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                totalItems: { "type": "integer", "example": 16 },
                                                totalPages: { "type": "integer", "example": 4 },
                                                currentPage: { "type": "integer", "example": 1 },
                                                limit: { "type": "integer", "example": 5 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Profile" }
                                                }
                                            }
                                        }
                                    ]
                                },
                            }
                        }
                    },
                    400: {
                        description: "Invalid Query Parameters",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/comments/{uuid}": {
            get: {
                tags: ["Comments"],
                summary: "Retrieve a comment by its UUID",
                description: "Fetches the details of a specific comment using its unique identifier. Returns a 404 error if the comment does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "uuid",
                        in: "path",
                        required: true,
                        description: "UUID of the comment to find",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: {
                        description: "Comment by uuid",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Comment",
                                        }
                                    }
                                },
                            },
                        }
                    },
                    400: {
                        description: "Invalid Profile UUID",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Comment Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Comment with uuid: cef1b4d6-03d7-4a28-a9db-4493301c7e9e not found",
                                },
                            },
                        },
                    },
                }
            },
            patch: {
                tags: ["Comments"],
                summary: "Update a comment by its UUID. Admin action",
                description: "Updates the properties of a specific comment identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the profile does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "uuid",
                        in: "path",
                        required: true,
                        description: "UUID of the comment to find",
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    description: "JSON with the updated comment data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["title"],
                                properties: {
                                    title: {type: "string"},
                                    status: {
                                        type: "string",
                                        enum: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
                                    },
                                }
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Successful Update Comment by its UUID",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Comment",
                                        }
                                    }
                                },
                            },
                        }
                    },
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Profile Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Profile with id: 1 not found",
                                },
                            },
                        },
                    },
                }
            },
            delete: {
                tags: ["Comments"],
                summary: "Delete a comment by its UUID. Admin action",
                description: "Permanently deletes the specified comment from the database using its unique UUID. Only users with ADMIN role are authorized. Returns a 204 No Content status if successful or a 404 error if the comment does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "uuid",
                        in: "path",
                        required: true,
                        description: "UUID of the comment to find",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    204: {
                        description:
                            "Comment deleted successfully. No content is returned.",
                    },
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Comment Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Comment with uuid: cef1b4d6-03d7-4a28-a9db-4493301c7e9e not found",
                                },
                            },
                        },
                    },
                }
            }
        },
        "/api/v1/comments/user/{uuid}": {
            get: {
                tags: ["Comments"],
                summary: "Retrieve all comments of a specific user by its unique UUID. Admin Action",
                description:
                    "Returns a list of all comments of a specific user, optionally paginated. Support filtering by comment status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "uuid",
                        in: "path",
                        required: true,
                        description: "UUID of the user to find its comments",
                        schema: { type: "string" },
                    },
                    {
                        name: "status",
                        in: "query",
                        description: "Filter by one or more comment status values. You can repeat the parameter (?status=ACTIVE&status=INACTIVE) or provide a single value.",
                        required: false,
                        style: "form",
                        explode: true,
                        schema: {
                            type: "array",
                            items: {
                                type: "string",
                                enum: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
                            },
                        },
                        example: ["ACTIVE", "INACTIVE"],
                    },
                    {
                        name: "paginated",
                        in: "query",
                        description: "Set to true to paginate results.",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["true", "false"],
                            default: "false"
                        }
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Page number (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "1"
                        }
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Number of results per page (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "50"
                        }
                    },
                ],
                responses: {
                    200: {
                        description: "List of all comments of a specific user by its unique UUID or paginated comments with optional filters",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                results: { "type": "integer", "example": 2 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Comment" }
                                                }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                totalItems: { "type": "integer", "example": 16 },
                                                totalPages: { "type": "integer", "example": 4 },
                                                currentPage: { "type": "integer", "example": 1 },
                                                limit: { "type": "integer", "example": 5 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Profile" }
                                                }
                                            }
                                        }
                                    ]
                                },
                            }
                        }
                    },
                    400: {
                        description: "Invalid Query Parameters",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    404: {
                        description: "User Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "User with uuid: cef1b4d6-03d7-4a28-a9db-4493301c7e9e not found",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/comments/post/{uuid}": {
            get: {
                tags: ["Comments"],
                summary: "Retrieve all comments of a specific post by its unique UUID. Admin Action",
                description:
                    "Returns a list of all comments of a specific post, optionally paginated. Support filtering by comment status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "uuid",
                        in: "path",
                        required: true,
                        description: "UUID of the post to find its comments",
                        schema: { type: "string" },
                    },
                    {
                        name: "status",
                        in: "query",
                        description: "Filter by one or more comment status values. You can repeat the parameter (?status=ACTIVE&status=INACTIVE) or provide a single value.",
                        required: false,
                        style: "form",
                        explode: true,
                        schema: {
                            type: "array",
                            items: {
                                type: "string",
                                enum: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
                            },
                        },
                        example: ["ACTIVE", "INACTIVE"],
                    },
                    {
                        name: "paginated",
                        in: "query",
                        description: "Set to true to paginate results.",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["true", "false"],
                            default: "false"
                        }
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Page number (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "1"
                        }
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Number of results per page (paginated mode only).",
                        required: false,
                        schema: {
                            type: "string",
                            default: "50"
                        }
                    },
                ],
                responses: {
                    200: {
                        description: "List of all comments of a specific post by its unique UUID or paginated comments with optional filters",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                results: { "type": "integer", "example": 2 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Comment" }
                                                }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: { "type": "string", "example": "success" },
                                                totalItems: { "type": "integer", "example": 16 },
                                                totalPages: { "type": "integer", "example": 4 },
                                                currentPage: { "type": "integer", "example": 1 },
                                                limit: { "type": "integer", "example": 5 },
                                                data: {
                                                    type: "array",
                                                    items: { "$ref": "#/components/schemas/Profile" }
                                                }
                                            }
                                        }
                                    ]
                                },
                            }
                        }
                    },
                    400: {
                        description: "Invalid Query - Path Parameters",
                        content: {
                            "application/json": {
                                example: {
                                    status: "ValidationError",
                                    message: "Invalid input.",
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
                    401: {
                        description: "Access restriction to not authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotAuthorized",
                                    message: "No token provided",
                                },
                            },
                        },
                    },
                    403: {
                        description: "Access restriction to not admin authenticated users",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityForbiddenAction",
                                    message: "You are not authorized to perform this action",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Post Not Found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "EntityNotFound",
                                    message: "Post with uuid: cef1b4d6-03d7-4a28-a9db-4493301c7e9e not found",
                                },
                            },
                        },
                    },
                },
            },
        },
    }
}
