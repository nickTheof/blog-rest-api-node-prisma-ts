import {Role} from "@prisma/client";
import {OpenAPIV3} from "openapi-types";

function createErrorResponse(
    description: string,
    example: Record<string, unknown>
): OpenAPIV3.ResponseObject {
    return {
        description,
        content: {
            "application/json": {
                example,
            },
        },
    };
}

export const responserError400InvalidQueryParams: OpenAPIV3.ResponseObject = createErrorResponse(
    "Invalid Query Parameters",
    {
        status: "ValidationError",
        message: "Invalid input.",
        errors: {
            type: "array",
            items: {
                type: "string"
            }
        }
    }
)

export const responserError400InvalidPathParams: OpenAPIV3.ResponseObject = createErrorResponse(
    "Invalid Path Parameters",
    {
        status: "ValidationError",
        message: "Invalid input.",
        errors: {
            type: "array",
            items: {
                type: "string"
            }
        }
    }
)

export const responserError401: OpenAPIV3.ResponseObject = createErrorResponse(
    "Access restriction to not authenticated users",
    {
        status: "EntityNotAuthorized",
        message: "No token provided",
    }
);


export const responserError403Forbidden= (...Roles: Role[]): OpenAPIV3.ResponseObject => createErrorResponse(
    `Access restriction to not ${Roles.join("-")} authenticated users`,
    {
        status: "EntityForbiddenAction",
        message: "You are not authorized to perform this action",
    }
)


export const responserError404NotFound = (entity: string) => {
    return  createErrorResponse(`Resource not found for ${entity}`,  {
        status: "EntityNotFound",
        message: "Resource not found",
    })
} ;

export const responserError409Conflict = (entity: string) => {
    return  createErrorResponse(`Resource already exists for ${entity}`,  {
        status: "EntityAlreadyExists",
        message: "Duplicate entry on unique field.",
    })
} ;

export const responserError400Validation = (entity: string) => {
    return  createErrorResponse(`Validation error for ${entity}`,  {
        status: "ValidationError",
        message: "Validation error",
    })
} ;

export enum RefModels {
    CATEGORY = "#/components/schemas/Category",
    COMMENT = "#/components/schemas/Comment",
    POST = "#/components/schemas/Post",
    PROFILE = "#/components/schemas/Profile",
    TAG = "#/components/schemas/Tag",
    USER = "#/components/schemas/User",
}

export const successOKSchema = (ref: RefModels): OpenAPIV3.SchemaObject => {
    return {
        type: "object",
        properties: {
            status: {"type": "string", "example": "success"},
            data: {
                type: "array",
                items: {"$ref": ref}
            }
        }
    }
}

export const successOKNonPaginatedSchema = (ref: RefModels): OpenAPIV3.SchemaObject => {
    return {
        type: "object",
        properties: {
            status: {"type": "string", "example": "success"},
            results: {"type": "integer", "example": 2},
            data: {
                type: "array",
                items: {"$ref": ref}
            }
        }
    }
}

export const successOKPaginatedSchema = (ref: RefModels): OpenAPIV3.SchemaObject => {
    return {
        type: "object",
        properties: {
            status: {"type": "string", "example": "success"},
            totalItems: {"type": "integer", "example": 16},
            totalPages: {"type": "integer", "example": 4},
            currentPage: {"type": "integer", "example": 1},
            limit: {"type": "integer", "example": 5},
            data: {
                type: "array",
                items: {"$ref": ref}
            }
        }
    }
}

