import {OpenAPIV3} from "openapi-types";
import {
    commentStatusParam,
    paginationSchemaParams,
    postStatusParam,
    postUuidParam,
    userIsActiveParam,
    userUuidParam
} from "../helpers/params.swagger";
import {
    RefModels,
    responserError400InvalidPathParams,
    responserError400InvalidQueryParams,
    responserError400Validation,
    responserError401,
    responserError403Forbidden,
    responserError404NotFound,
    responserError409Conflict,
    successOKNonPaginatedSchema,
    successOKPaginatedSchema,
    successOKSchema
} from "../helpers/responses.swagger";
import {Role} from "@prisma/client";
import {
    postCreateBodySchema,
    profileBodySchema,
    userBodySchemaAdminAction,
    userBodyUpdateSchema,
    userBodyUpdateSchemaAdminAction
} from "../helpers/request-body.swagger";

export const usersSwaggerPaths: OpenAPIV3.PathsObject = {
    "/api/v1/users":{
        get: {
            tags: ["Users", "Admin"],
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
                                    successOKNonPaginatedSchema(RefModels.USER),
                                    successOKPaginatedSchema(RefModels.USER)
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
            tags: ["Users", "Admin"],
            summary: "Create a new user. Admin action",
            description:
                "Returns a new created User. Require an authenticated user with admin role",
            security: [{ bearerAuth: [] }],
            requestBody: userBodySchemaAdminAction,
            responses: {
                200: {
                    description:
                        "JSON response of a successful creation of a new user",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.USER)
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
    "/api/v1/users/me": {
        get: {
            tags: ["Users", "Me - Current User"],
            summary: "Get the current user",
            description: "Returns the details of the currently authenticated user.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Current authenticated user details",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.USER)
                        }
                    }
                },
                401: responserError401,
            }
        },
        patch: {
            tags: ["Users", "Me - Current User"],
            summary: "Update the current user",
            description: "Updates the properties of the currently authenticated user. Accepts a JSON object with the fields to be updated. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            requestBody: userBodyUpdateSchema,
            responses: {
                200: {
                    description:
                        "JSON response of a successful update of the user",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.USER)
                        }
                    }
                },
                400: responserError400Validation("Invalid request body data"),
                401: responserError401,
                409: responserError409Conflict("User"),
            }
        },
        delete: {
            tags: ["Users", "Me - Current User"],
            summary: "Delete the current user",
            description: "Soft deletes the currently authenticated user from the database. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            responses: {
                204: {
                    description:
                        "User deleted successfully. No content is returned.",
                },
                401: responserError401,
            }
        }
    },
    "/api/v1/users/{uuid}": {
        get: {
            tags: ["Users", "Admin"],
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
                            schema: successOKSchema(RefModels.USER)
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
            tags: ["Users", "Admin"],
            summary: "Update a user by its UUID. Admin action",
            description: "Updates the properties of a specific user identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the user does not exist.",
            security: [{ bearerAuth: [] }],
            parameters: [
                userUuidParam
            ],
            requestBody: userBodyUpdateSchemaAdminAction,
            responses: {
                200: {
                    description:
                        "JSON response of a successful update of the user",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.USER)
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
            tags: ["Users", "Admin"],
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
            tags: ["Users", "Comments", "Admin"],
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
                                    successOKNonPaginatedSchema(RefModels.COMMENT),
                                    successOKPaginatedSchema(RefModels.COMMENT)
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
    "/api/v1/users/me/posts": {
        get: {
            tags: ["Users", "Posts", "Me - Current User"],
            summary: "Get all posts by current user",
            description: "Returns a list of all posts for the currently authenticated user or paginated posts for the currently authenticated user. Support filtering by post status.",
            security: [{ bearerAuth: [] }],
            parameters: [
                postStatusParam,
                ...paginationSchemaParams
            ],
            responses: {
                200: {
                    description: "List of all posts or paginated posts",
                    content: {
                        "application/json": {
                            schema: {
                                oneOf: [
                                    successOKNonPaginatedSchema(RefModels.POST),
                                    successOKPaginatedSchema(RefModels.POST)
                                ]
                            },
                        }
                    }
                },
                401: responserError401,
            }
        },
        post: {
            tags: ["Users", "Posts", "Me - Current User"],
            summary: "Create a post for the current user",
            description: "Creates a new post for the currently authenticated user. Accepts a JSON object with the post data. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            requestBody: postCreateBodySchema,
            responses: {
                201: {
                    description: "Post created successfully",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.POST)
                        }
                    }
                },
                400: responserError400Validation("Invalid request body data"),
                401: responserError401,
            }
        }
    },
    "/api/v1/users/{uuid}/posts": {
        get: {
            tags: ["Users", "Posts", "Admin"],
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
                                   successOKNonPaginatedSchema(RefModels.POST),
                                    successOKPaginatedSchema(RefModels.POST)
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
    "/api/v1/users/me/posts/{uuid}": {
        get: {
            tags: ["Users", "Posts", "Admin"],
            summary: "Get a post by current user UUID and post UUID",
            description: "Returns a specific post for the currently authenticated user. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            parameters: [
                postUuidParam
            ],
            responses: {
                200: {
                    description: "The details of the created new post",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.POST)
                        }
                    }
                },
                401: responserError401,
                404: responserError404NotFound("Post"),
            }
        },
        patch: {
            tags: ["Users", "Posts"],
            summary: "Current authenticated user updates its own post by post UUID",
            description: "Updates the properties of a specific post for the currently authenticated user identified by its unique ID. Accepts a JSON object with the fields to be updated. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            parameters: [
                postUuidParam
            ],
            requestBody: postCreateBodySchema,
            responses: {
                200: {
                    description:
                        "JSON response of a successful update of the post",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.POST)
                        }
                    }
                },
                400: responserError400Validation("Invalid request body or path data"),
                401: responserError401,
                404: responserError404NotFound("Post"),
            }
        },
        delete: {
            tags: ["Users", "Posts", "Admin"],
            summary: "Current authenticated user deletes its own post by post UUID",
            description: "Current authenticated user soft deletes the specified post from the database for the currently authenticated user using its unique ID. Returns a 204 No Content status if successful or a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            parameters: [
                postUuidParam
            ],
            responses: {
                204: {
                    description: "Post deleted successfully. No content is returned.",
                },
                400: responserError400InvalidPathParams,
                401: responserError401,
                404: responserError404NotFound("Post")
            }
        }
    },
    "/api/v1/users/{uuid}/posts/{postUuid}": {
        get: {
            tags: ["Users", "Posts", "Admin"],
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
                            schema: successOKSchema(RefModels.POST)
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
            tags: ["Users", "Posts", "Admin"],
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
            requestBody: postCreateBodySchema,
            responses: {
                200: {
                    description:
                        "JSON response of a successful update of the post",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.POST)
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
            tags: ["Users", "Posts", "Admin"],
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

    "/api/v1/users/me/profile": {
        get: {
            tags: ["Users", "Profiles", "Me - Current User"],
            summary: "Get the current user profile",
            description: "Returns the details of the currently authenticated user's profile.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Current authenticated user profile details",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.PROFILE)
                        }
                    }
                },
                401: responserError401,
            }
        },
        post: {
            tags: ["Users", "Profiles", "Me - Current User"],
            summary: "Update the current user profile",
            description: "Updates the properties of the currently authenticated user's profile. Accepts a JSON object with the fields to be updated. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            requestBody: profileBodySchema,
            responses: {
                200: {
                    description:
                        "JSON response of a successful update of the profile",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.PROFILE)
                        },
                    }
                },
                400: responserError400Validation("Invalid request body data"),
                401: responserError401,
                409: responserError409Conflict("Profile"),
            }
        },
        patch: {
            tags: ["Users", "Profiles", "Me - Current User"],
            summary: "Update the current user profile",
            description: "Updates the properties of the currently authenticated user's profile. Accepts a JSON object with the fields to be updated. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            requestBody: profileBodySchema,
            responses: {
                200: {
                    description:
                        "JSON response of a successful update of the profile",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.PROFILE),
                        }
                    }
                },
                400: responserError400Validation("Invalid request body data"),
                401: responserError401,
                404: responserError404NotFound("Profile"),
            }
        },
        delete: {
            tags: ["Users", "Profiles", "Me - Current User"],
            summary: "Delete the current user profile",
            description: "Permanent delete the currently authenticated user's profile from the database. Returns a 401 error if the user is not authenticated.",
            security: [{ bearerAuth: [] }],
            responses: {
                204: {
                    description:
                        "User profile deleted successfully. No content is returned.",
                },
                401: responserError401,
            }
        }
    },
}