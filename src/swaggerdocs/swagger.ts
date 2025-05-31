import {OpenAPIV3} from 'openapi-types';
import {
    responserError400InvalidPathParams,
    responserError400InvalidQueryParams, responserError400Validation,
    responserError401,
    responserError403Forbidden,
    responserError404NotFound, responserError409Conflict
} from "./responses.swagger";
import {Role} from "@prisma/client";
import {
    categoryIdParam,
    commentStatusParam,
    commentUuidParam,
    paginationSchemaParams,
    postStatusParam,
    postUuidParam, profileIdParam, userIsActiveParam, userUuidParam
} from "./params.swagger";

const swaggerDefinition = {
    openapi: "3.0.0",
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
                    401: responserError401,
                }
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
                    400: responserError400Validation("Registration failed with invalid data"),
                    409:responserError409Conflict("User"),
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
                    ...paginationSchemaParams
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
                    400: responserError400InvalidQueryParams,
                    401: responserError401,
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
                    400: responserError400Validation("Invalid request body data"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN, Role.EDITOR),
                    409: responserError409Conflict("Category"),
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
                   categoryIdParam
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
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    404: responserError404NotFound("Category"),
                }
            },
            patch: {
                tags: ["Categories"],
                summary: "Update a category by its ID. Admin - Editor action.",
                description: "Updates the properties of a specific category identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN or EDITOR roles are authorized. Returns a 404 error if the category does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    categoryIdParam
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
                    400: responserError400Validation("Invalid request body data"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN, Role.EDITOR),
                    404: responserError404NotFound("Category"),
                    409: responserError409Conflict("Category"),
                },
            },
            delete: {
                tags: ["Categories"],
                summary: "Delete a category by its ID. Admin - Editor action",
                description: "Permanently deletes the specified category from the database using its unique ID. Only users with ADMIN or EDITOR roles are authorized. Returns a 204 No Content status if successful or a 404 error if the category does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    categoryIdParam
                ],
                responses: {
                    204: {
                        description:
                            "Category deleted successfully. No content is returned.",
                    },
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN, Role.EDITOR),
                    404: responserError404NotFound("Category"),
                },
            }
        },
        "/api/v1/users":{
            get: {
                tags: ["Users"],
                summary: "Get all users in a list",
                description:
                    "Returns a list of all users, optionally paginated. Support filtering by user activity status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    userIsActiveParam,
                    ...paginationSchemaParams
                ],
                responses: {
                    200: {
                        description: "List of all users or paginated users",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: {"type": "string", "example": "success"},
                                                results: {"type": "integer", "example": 2},
                                                data: {
                                                    type: "array",
                                                    items: {"$ref": "#/components/schemas/User"}
                                                }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: {"type": "string", "example": "success"},
                                                totalItems: {"type": "integer", "example": 16},
                                                totalPages: {"type": "integer", "example": 4},
                                                currentPage: {"type": "integer", "example": 1},
                                                limit: {"type": "integer", "example": 5},
                                                data: {
                                                    type: "array",
                                                    items: {"$ref": "#/components/schemas/User"}
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    400: responserError400InvalidQueryParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN)
                }
            },
            post: {
                tags: ["Users"],
                summary: "Create a new user. Admin action",
                description:
                    "Returns a new created User. Require an authenticated user with admin role",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    description: "JSON with user data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string" },
                                    role: {
                                        type: "string",
                                        enum: [
                                            "USER", "EDITOR", "ADMIN"
                                        ]
                                    },
                                    isActive: {
                                        type: "boolean",
                                        default: true
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description:
                            "JSON response of a successful creation of a new user",
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
                                            $ref: "#/components/schemas/User",
                                        },
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Invalid request body data"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    409: responserError409Conflict("User"),
                }
            }
        },
        "/api/v1/users/{uuid}": {
            get: {
                tags: ["Users"],
                summary: "Retrieve a user by its UUID. Admin Action",
                description: "Fetches the details of a specific user using its unique identifier. Returns a 404 error if the user does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    userUuidParam
                ],
                responses: {
                    200: {
                        description: "User by uuid",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                        }
                                        ,
                                        data: {
                                            $ref: "#/components/schemas/User",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("User"),
                }
            },
            patch: {
                tags: ["Users"],
                summary: "Update a user by its UUID. Admin action",
                description: "Updates the properties of a specific user identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the user does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    userUuidParam
                ],
                requestBody: {
                    description: "JSON with the updated user data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [],
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string" },
                                    role: {
                                        type: "string",
                                        enum: [
                                            "USER", "EDITOR", "ADMIN"
                                        ]
                                    },
                                    isActive: {
                                        type: "boolean",
                                        default: true
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description:
                            "JSON response of a successful update of the user",
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
                                            $ref: "#/components/schemas/User",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Invalid request data"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("User"),
                    409: responserError409Conflict("User"),
                }
            },
            delete: {
                tags: ["Users"],
                summary: "Delete a user by its UUID. Admin action",
                description: "Permanently deletes the specified user from the database using its unique ID. Only users with ADMIN role are authorized. Returns a 204 No Content status if successful or a 404 error if the user does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    userUuidParam
                ],
                responses: {
                    204: {
                        description:
                            "User deleted successfully. No content is returned.",
                    },
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("User"),
                }
            }
        },
        "/api/v1/users/{uuid}/comments": {
            get: {
                tags: ["Users", "Comments"],
                summary: "Get all comments by user UUID",
                description: "Returns a list of all comments for a specific user or paginated comments for a specific user. Support filtering by comment status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    commentStatusParam,
                    userUuidParam,
                    ...paginationSchemaParams
                ],
                responses: {
                    200: {
                        description: "List of all comments or paginated comments",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: {"type": "string", "example": "success"},
                                                results: {"type": "integer", "example": 2},
                                                data: {
                                                    type: "array",
                                                    items: {"$ref": "#/components/schemas/Comment"}
                                                }
                                            }

                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: {"type": "string", "example": "success"},
                                                totalItems: {"type": "integer", "example": 16},
                                                totalPages: {"type": "integer", "example": 4},
                                                currentPage: {"type": "integer", "example": 1},
                                                limit: {"type": "integer", "example": 5},
                                                data: {
                                                    type: "array",
                                                    items: {"$ref": "#/components/schemas/Comment"}
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Invalid query or path params"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("User"),
                }
            }
        },
        "/api/v1/users/{uuid}/posts": {
            get: {
                tags: ["Users", "Posts"],
                summary: "Get all posts by user UUID",
                description: "Returns a list of all posts for a specific user or paginated posts for a specific user. Support filtering by post status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postStatusParam,
                    userUuidParam,
                    ...paginationSchemaParams
                ],
                responses: {
                    200: {
                        description: "List of all posts or paginated posts",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                status: {"type": "string", "example": "success"},
                                                results: {"type": "integer", "example": 2},
                                                data: {
                                                    type: "array",
                                                    items: {"$ref": "#/components/schemas/Post"}
                                                }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                status: {"type": "string", "example": "success"},
                                                totalItems: {"type": "integer", "example": 16},
                                                totalPages: {"type": "integer", "example": 4},
                                                currentPage: {"type": "integer", "example": 1},
                                                limit: {"type": "integer", "example": 5},
                                                data: {
                                                    type: "array",
                                                    items: {"$ref": "#/components/schemas/Post"}
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Invalid query or path params"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("User"),
                }
            }
        },
        "/api/v1/users/{uuid}/posts/{postUuid}": {
            get: {
                tags: ["Users", "Posts"],
                summary: "Get a post by user UUID and post UUID",
                description: "Returns a specific post for a specific user. Returns a 404 error if the post does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    userUuidParam,
                    {
                        name: "postUuid",
                        description: "UUID of the post.",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "123e4567-e89b-12d3-a456-426655440000",
                    }
                ],
                responses: {
                    200: {
                        description: "Post by user uuid and post uuid",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Post",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Post or User"),
                }
            },
            patch: {
                tags: ["Users", "Posts"],
                summary: "Update a post by user UUID and post UUID. Admin Action.",
                description: "Updates the properties of a specific post identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the post does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    userUuidParam,
                    {
                        name: "postUuid",
                        description: "UUID of the post.",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            example: "123e4567-e89b-12d3-a456-426655440000",
                        }
                    }
                ],
                requestBody: {
                    description: "JSON with the updated post data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [],
                                properties: {
                                    title: { type: "string" },
                                    content: { type: "string" },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "DRAFT", "PUBLISHED", "DELETED", "ARCHIVED"
                                        ]
                                    },
                                    categories: {
                                        type: "array",
                                        items: {
                                            type: "integer",
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description:
                            "JSON response of a successful update of the post",
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
                                            $ref: "#/components/schemas/Post",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Invalid request body or path data"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Post or User"),
                    409: responserError409Conflict("Post"),
                }
            },
            delete: {
                tags: ["Users", "Posts"],
                summary: "Delete a post by user UUID and post UUID. Admin Action.",
                description: "Permanently deletes the specified post from the database using its unique ID. Only users with ADMIN role are authorized. Returns a 204 No Content status if successful or a 404 error if the post does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    userUuidParam,
                    {
                        name: "postUuid",
                        description: "UUID of the post.",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            example: "123e4567-e89b-12d3-a456-426655440000",
                        }
                    }
                ],
                responses: {
                    204: {
                        description:
                            "Post deleted successfully. No content is returned.",
                    },
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Post or User"),
                }
            },
        },
        "/api/v1/profiles": {
            get: {
                tags: ["Profiles"],
                summary: "Get all profiles in a list. Admin Action",
                description:
                    "Returns a list of all profiles, optionally paginated.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    ...paginationSchemaParams
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
                    400: responserError400InvalidQueryParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
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
                    profileIdParam
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
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    404: responserError404NotFound("Profile"),
                }
            },
            patch: {
                tags: ["Profiles"],
                summary: "Update a profile by its ID. Admin action",
                description: "Updates the properties of a specific profile identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the profile does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    profileIdParam
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
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    404: responserError404NotFound("Profile"),
                }
            },
            delete: {
                tags: ["Profiles"],
                summary: "Delete a profile by its ID. Admin action",
                description: "Permanently deletes the specified profile from the database using its unique ID. Only users with ADMIN role are authorized. Returns a 204 No Content status if successful or a 404 error if the profile does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    profileIdParam
                ],
                responses: {
                    204: {
                        description:
                            "Profile deleted successfully. No content is returned.",
                    },
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Profile"),
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
                    commentStatusParam,
                    ...paginationSchemaParams
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
                    400: responserError400InvalidQueryParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN)
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
                    commentUuidParam
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
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    404: responserError404NotFound("Comment")
                }
            },
            patch: {
                tags: ["Comments"],
                summary: "Update a comment by its UUID. Admin action",
                description: "Updates the properties of a specific comment identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the profile does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    commentUuidParam,
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
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Profile")
                }
            },
            delete: {
                tags: ["Comments"],
                summary: "Delete a comment by its UUID. Admin action",
                description: "Permanently deletes the specified comment from the database using its unique UUID. Only users with ADMIN role are authorized. Returns a 204 No Content status if successful or a 404 error if the comment does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                   commentUuidParam
                ],
                responses: {
                    204: {
                        description:
                            "Comment deleted successfully. No content is returned.",
                    },
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Comment")
                }
            }
        },
        "/api/v1/comments/user/{uuid}": {
            get: {
                tags: ["Comments", "Users"],
                summary: "Retrieve all comments of a specific user by its unique UUID. Admin Action",
                description:
                    "Returns a list of all comments of a specific user, optionally paginated. Support filtering by comment status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    commentUuidParam,
                    commentStatusParam,
                    ...paginationSchemaParams,
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
                    400: responserError400Validation("Comment"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("User")
                },
            },
        },
        "/api/v1/comments/post/{uuid}": {
            get: {
                tags: ["Comments", "Posts"],
                summary: "Retrieve all comments of a specific post by its unique UUID. Admin Action",
                description:
                    "Returns a list of all comments of a specific post, optionally paginated. Support filtering by comment status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    commentUuidParam,
                    commentStatusParam,
                    ...paginationSchemaParams
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
                    400: responserError400Validation("Query - Path Parameters"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Post")
                },
            },
        },
        "/api/v1/posts": {
            get: {
                tags: ["Posts"],
                summary: "Retrieve all posts",
                description: "Returns a list of all posts, optionally paginated. Support filtering by post status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                   postStatusParam,
                    ...paginationSchemaParams
                ],
                responses: {
                    200: {
                        description: "List of all posts or paginated posts with optional filters",
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
                                                    items: { "$ref": "#/components/schemas/Post" }
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
                                                    items: { "$ref": "#/components/schemas/Post" }
                                                }
                                            }
                                        }
                                    ]
                                },
                            }
                        }
                    },
                    400: responserError400InvalidQueryParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN)
                },
            },
        },
        "/api/v1/posts/{uuid}": {
            get: {
                tags: ["Posts"],
                summary: "Retrieve a post by its UUID",
                description: "Fetches the details of a specific post using its unique identifier. Returns a 404 error if the post does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postUuidParam
                ],
                responses: {
                    200: {
                        description: "Post by uuid",
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
                                            $ref: "#/components/schemas/Post",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Post"),

                }
            },
            patch: {
                tags: ["Posts"],
                summary: "Update a post by its UUID. Admin action",
                description: "Updates the properties of a specific post identified by its unique UUID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the post does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postUuidParam
                ],
                requestBody: {
                    description: "JSON with the updated post data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [],
                                properties: {
                                    title: {type: "string"},
                                    description: {type: "string"},
                                    status: {
                                        type: "string",
                                        enum: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
                                    },
                                    categories: {
                                        type: "array",
                                        items: {
                                            type: "integer",
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Successful Update Post by its UUID",
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
                                            $ref: "#/components/schemas/Post",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Post"),
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Post"),
                }

            },
            delete: {
                tags: ["Posts"],
                summary: "Delete a post by its UUID. Admin action",
                description: "Permanently deletes the specified post from the database using its unique UUID. Only users with ADMIN role are authorized. Returns a 204 No Content status if successful or a 404 error if the post does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postUuidParam
                ],
                responses: {
                    204: {
                        description:
                            "Post deleted successfully. No content is returned.",
                    },
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    403: responserError403Forbidden(Role.ADMIN),
                    404: responserError404NotFound("Post"),
                }
            }
        },
        "/api/v1/posts/{uuid}/comments": {
            get: {
                tags: ["Posts", "Comments"],
                summary: "Retrieve all comments of a specific post by its unique UUID",
                description: "Returns a list of all comments of a specific post, optionally paginated. Support filtering by comment status.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postUuidParam,
                    ...paginationSchemaParams
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
                                                    items: { "$ref": "#/components/schemas/Post" }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    404: responserError404NotFound("Post"),
                }
            },
            post: {
                tags: ["Posts", "Comments"],
                summary: "Authenticated users creates a comment for a specific post by its UUID",
                description: "Creates a new comment for a specific post using its unique identifier. Returns a 404 error if the post does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postUuidParam
                ],
                responses: {
                    200: {
                        description: "Comment created successfully",
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
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Comment"),
                    401: responserError401,
                    404: responserError404NotFound("Post"),
                }
            }
        },
        "/api/v1/posts/{uuid}/comments/{commentUuid}": {
            patch: {
                tags: ["Posts", "Comments"],
                summary: "Authenticated user updates his own comment by its UUID",
                description: "Updates the properties of a specific comment identified by its unique UUID. Accepts a JSON object with the fields to be updated. Returns a 404 error if the post does not exist or the comment is not owned by the authenticated user.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postUuidParam,
                    {
                        name: "commentUuid",
                        in: "path",
                        required: true,
                        description: "UUID of the comment to update",
                        schema: { type: "string" },
                    }
                ],
                requestBody: {
                    description: "JSON with the updated comment data",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [],
                                properties: {
                                    content: {type: "string"},
                                    status: {
                                        type: "string",
                                        enum: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
                                    },
                                }
                            }
                        }
                    }
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
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Comment",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: responserError400Validation("Comment"),
                    401: responserError401,
                    404: responserError404NotFound("Post or Comment"),
                }
            },
            delete: {
                tags: ["Posts", "Comments"],
                summary: "Delete a comment by its UUID. An authenticated user can delete his own comment",
                description: "Soft deletes the specified comment from the database using its unique UUID. Change the status of the comment to DELETED. Returns a 204 No Content status if successful or a 404 error if the comment does not exist.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    postUuidParam,
                    {
                        name: "commentUuid",
                        in: "path",
                        required: true,
                        description: "UUID of the comment to update",
                        schema: { type: "string" },
                    }
                ],
                responses: {
                    204: {
                        description:
                            "Comment deleted successfully. No content is returned.",
                    },
                    400: responserError400InvalidPathParams,
                    401: responserError401,
                    404: responserError404NotFound("Post or Comment"),
                }
            }
        }
    }
}
