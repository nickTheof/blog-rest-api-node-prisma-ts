import {OpenAPIV3} from "openapi-types";
import {categoryIdParam, paginationSchemaParams} from "../helpers/params.swagger";
import {categoryBodySchema} from "../helpers/request-body.swagger";
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

export const categoriesSwaggerPaths: OpenAPIV3.PathsObject = {
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
                                    successOKNonPaginatedSchema(RefModels.CATEGORY),
                                    successOKPaginatedSchema(RefModels.CATEGORY)
                                ]
                            }
                        }
                    }
                },
                400: responserError400InvalidQueryParams,
                401: responserError401,
            },
        },
        post: {
            tags: ["Categories", "Admin"],
            summary: "Create a new category. Admin - Editor action",
            description:
                "Returns a new created Category. Require an authenticated user with admin or editor role",
            security: [{ bearerAuth: [] }],
            requestBody: categoryBodySchema,
            responses: {
                201: {
                    description:
                        "JSON response of a successful creation of a new category",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.CATEGORY),
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
                            schema: successOKSchema(RefModels.CATEGORY),
                            },
                        },
                    },
                400: responserError400InvalidPathParams,
                401: responserError401,
                404: responserError404NotFound("Category"),
            }
        },
        patch: {
            tags: ["Categories", "Admin"],
            summary: "Update a category by its ID. Admin - Editor action.",
            description: "Updates the properties of a specific category identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN or EDITOR roles are authorized. Returns a 404 error if the category does not exist.",
            security: [{ bearerAuth: [] }],
            parameters: [
                categoryIdParam
            ],
            requestBody: categoryBodySchema,
            responses: {
                200: {
                    description:
                        "JSON response of a successful update of the category",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.CATEGORY),
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
            tags: ["Categories", "Admin"],
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
}