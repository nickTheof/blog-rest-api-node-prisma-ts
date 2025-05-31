import {OpenAPIV3} from "openapi-types";
import {paginationSchemaParams, postStatusParam, postUuidParam} from "../helpers/params.swagger";
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
import {commentBodySchema, postBodySchema} from "../helpers/request-body.swagger";

export const postsSwaggerPaths: OpenAPIV3.PathsObject = {
    "/api/v1/posts": {
        get: {
            tags: ["Posts", "Admin"],
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
                                    successOKNonPaginatedSchema(RefModels.POST),
                                    successOKPaginatedSchema(RefModels.POST)
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
            tags: ["Posts", "Admin"],
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
                            schema: successOKSchema(RefModels.POST)
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
            tags: ["Posts", "Admin"],
            summary: "Update a post by its UUID. Admin action",
            description: "Updates the properties of a specific post identified by its unique UUID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the post does not exist.",
            security: [{ bearerAuth: [] }],
            parameters: [
                postUuidParam
            ],
            requestBody: postBodySchema,
            responses: {
                200: {
                    description: "Successful Update Post by its UUID",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.POST)
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
            tags: ["Posts", "Admin"],
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
            tags: ["Posts", "Comments", "Admin"],
            summary: "Retrieve all comments of a specific post by its unique UUID",
            description: "Returns a list of all comments of a specific post, optionally paginated. Support filtering by comment status.",
            security: [{bearerAuth: []}],
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
                                    successOKNonPaginatedSchema(RefModels.COMMENT),
                                    successOKPaginatedSchema(RefModels.COMMENT),
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
            security: [{bearerAuth: []}],
            parameters: [
                postUuidParam
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
                    description: "The Created Comment for the Post",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.COMMENT)
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
                        schema: commentBodySchema,
                    }
                }
            },
            responses: {
                200: {
                    description: "Successful Update Comment by its UUID",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.COMMENT)
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