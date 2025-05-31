import {OpenAPIV3} from 'openapi-types';

const bearerAuth: OpenAPIV3.HttpSecurityScheme = {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
}

const securitySchemes: OpenAPIV3.ComponentsObject['securitySchemes'] = {
    bearerAuth
}

const userSchema: OpenAPIV3.SchemaObject = {
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
}

const profileSchema: OpenAPIV3.SchemaObject = {
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
}

const postSchema: OpenAPIV3.SchemaObject = {
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
}

const categorySchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: {
            type: "integer"
        },
        name: {
            type: "string"
        },
        posts: {
            type: "array",
            items: {
                "$ref": "#/components/schemas/Post"
            }
        }
    }
}

const commentSchema: OpenAPIV3.SchemaObject = {
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
}

const schemas: OpenAPIV3.ComponentsObject['schemas'] = {
    User: userSchema,
    Profile: profileSchema,
    Post: postSchema,
    Category: categorySchema,
    Comment: commentSchema,
}

export const components: OpenAPIV3.ComponentsObject = {
    securitySchemes,
    schemas
}