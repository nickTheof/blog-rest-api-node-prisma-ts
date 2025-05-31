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
    return  createErrorResponse(`, Resource not found for ${entity}`,  {
        status: "EntityNotFound",
        message: "Resource not found",
    })
} ;

export const responserError409Conflict = (entity: string) => {
    return  createErrorResponse(`, Resource already exists for ${entity}`,  {
        status: "EntityAlreadyExists",
        message: "Resource already exists",
    })
} ;

export const responserError400Validation = (entity: string) => {
    return  createErrorResponse(`, Validation error for ${entity}`,  {
        status: "ValidationError",
        message: "Validation error",
    })
} ;

