import {OpenAPIV3} from "openapi-types";

function createQueryParameter(param: Omit<OpenAPIV3.ParameterObject, 'in' | 'required'> & { required?: boolean }): OpenAPIV3.ParameterObject {
    return {
        ...param,
        in: "query",
        required: param.required ?? false,
    };
}

function createPathParameter(param: Omit<OpenAPIV3.ParameterObject, 'in' | 'required'> & { required?: boolean }): OpenAPIV3.ParameterObject {
    return {
        ...param,
        in: "path",
        required: param.required ?? true,
    };
}

const paginatedParam: OpenAPIV3.ParameterObject = createQueryParameter({
    name: "paginated",
    description: "Set to true to paginate results.",
    schema: {
        type: "string",
        enum: ["true", "false"],
        default: "false"
    }
});

const pageParam:OpenAPIV3.ParameterObject = createQueryParameter({
    name: "page",
    description: "Page number.",
    schema: {
        type: "number",
        default: 1
    }
});

const limitParam: OpenAPIV3.ParameterObject = createQueryParameter({
    name: "limit",
    description: "Number of results per page.",
    schema: {
        type: "number",
        default: 10
    }
})

export const paginationSchemaParams: OpenAPIV3.ParameterObject[] = [paginatedParam, pageParam, limitParam];
export const postStatusParam: OpenAPIV3.ParameterObject = createQueryParameter({
    name: "status",
    description: "Filter by one or more post status values. You can repeat the parameter (?status=PUBLISHED&status=DRAFT) or provide a single value.",
    style: "form",
    explode: true,
    schema: {
        type: "array",
        items: {
            type: "string",
            enum: ["PUBLISHED", "DRAFT", "INACTIVE", "ARCHIVED"],
        },
    },
    example: ["PUBLISHED", "DRAFT"],
})

export const commentStatusParam: OpenAPIV3.ParameterObject = createQueryParameter(                   {
    name: "status",
    description: "Filter by one or more comment status values. You can repeat the parameter (?status=ACTIVE&status=INACTIVE) or provide a single value.",
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
})

export const userIsActiveParam: OpenAPIV3.ParameterObject = createQueryParameter({
    name: "isActive",
    description: "Filter to return only active users or return only inactive users.",
    schema: {
        type: "string",
    }
})


export const postUuidParam: OpenAPIV3.ParameterObject = createPathParameter({
    name: "uuid",
    description: "UUID of the post.",
    schema: {
        type: "string",
    },
    example: "123e4567-e89b-12d3-a456-426655440000",
})

export const commentUuidParam: OpenAPIV3.ParameterObject = createPathParameter({
    name: "uuid",
    description: "UUID of the comment.",
    schema: {
        type: "string",
    },
    example: "123e4567-e89b-12d3-a456-426655440000",
})

export const categoryIdParam: OpenAPIV3.ParameterObject = createPathParameter({
    name: "id",
    description: "ID of the category.",
    schema: {
        type: "integer"
    }
})

export const profileIdParam: OpenAPIV3.ParameterObject = createPathParameter({
    name: "id",
    description: "ID of the profile.",
    schema: {
        type: "integer"
    }
})

export const userUuidParam: OpenAPIV3.ParameterObject = createPathParameter({
    name: "uuid",
    description: "UUID of the user.",
    schema: {
        type: "string",
    },
    example: "123e4567-e89b-12d3-a456-426655440000",
})

