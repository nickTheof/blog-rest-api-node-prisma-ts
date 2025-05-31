import {OpenAPIV3} from "openapi-types";
import {paginationSchemaParams, profileIdParam} from "../helpers/params.swagger";
import {
    RefModels,
    responserError400InvalidPathParams,
    responserError400InvalidQueryParams,
    responserError401,
    responserError403Forbidden,
    responserError404NotFound,
    successOKNonPaginatedSchema,
    successOKPaginatedSchema,
    successOKSchema
} from "../helpers/responses.swagger";
import {Role} from "@prisma/client";
import {profileBodySchema} from "../helpers/request-body.swagger";

export const profilesSwaggerPaths: OpenAPIV3.PathsObject = {
    "/api/v1/profiles": {
        get: {
            tags: ["Profiles", "Admin"],
            summary: "Get all profiles in a list. Admin Action",
            description:
                "Returns a list of all profiles, optionally paginated.",
            security: [{bearerAuth: []}],
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
                                    successOKNonPaginatedSchema(RefModels.PROFILE),
                                    successOKPaginatedSchema(RefModels.PROFILE)
                                ]
                            },
                        }
                    },
                },
                400: responserError400InvalidQueryParams,
                401: responserError401,
                403: responserError403Forbidden(Role.ADMIN),
            },
        },
    },
    "/api/v1/profiles/{id}": {
        get: {
            tags: ["Profiles", "Admin"],
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
                            schema: successOKSchema(RefModels.PROFILE)
                        },
                    }
                },
                400: responserError400InvalidPathParams,
                401: responserError401,
                404: responserError404NotFound("Profile"),
            }
        },
        patch: {
            tags: ["Profiles", "Admin"],
            summary: "Update a profile by its ID. Admin action",
            description: "Updates the properties of a specific profile identified by its unique ID. Accepts a JSON object with the fields to be updated. Only users with ADMIN role are authorized. Returns a 404 error if the profile does not exist.",
            security: [{ bearerAuth: [] }],
            parameters: [
                profileIdParam
            ],
            requestBody: profileBodySchema,
            responses: {
                200: {
                    description: "Successful Update Profile by id",
                    content: {
                        "application/json": {
                            schema: successOKSchema(RefModels.PROFILE)
                        },
                    }
                },
                400: responserError400InvalidPathParams,
                401: responserError401,
                404: responserError404NotFound("Profile"),
            }
        },
        delete: {
            tags: ["Profiles", "Admin"],
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
}