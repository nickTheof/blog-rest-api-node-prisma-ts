import {OpenAPIV3} from "openapi-types";
import {commentStatusParam, commentUuidParam, paginationSchemaParams} from "../helpers/params.swagger";
import {
    RefModels,
    responserError400InvalidPathParams,
    responserError400InvalidQueryParams,
    responserError400Validation,
    responserError401,
    responserError403Forbidden,
    responserError404NotFound,
    successOKNonPaginatedSchema,
    successOKPaginatedSchema,
    successOKSchema
} from "../helpers/responses.swagger";
import {Role} from "@prisma/client";
import {commentBodySchema} from "../helpers/request-body.swagger";

export const commentsSwaggerPaths: OpenAPIV3.PathsObject = {
    "/api/v1/comments": {
        get: {
            tags: ["Comments", "Admin"],
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
                                    successOKNonPaginatedSchema(RefModels.COMMENT),
                                    successOKPaginatedSchema(RefModels.COMMENT)
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
            tags: ["Comments", "Admin"],
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
                            schema: successOKSchema(RefModels.COMMENT)
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
                        schema: commentBodySchema,
                    },
                },
            },
            responses: {
                200: {
                    description: "Successful Update Comment by its UUID",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.COMMENT)
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
            tags: ["Comments", "Users", "Admin"],
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
                                   successOKNonPaginatedSchema(RefModels.COMMENT),
                                    successOKPaginatedSchema(RefModels.COMMENT),
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
            tags: ["Comments", "Posts", "Admin"],
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
                                    successOKNonPaginatedSchema(RefModels.COMMENT),
                                    successOKPaginatedSchema(RefModels.COMMENT),
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
}