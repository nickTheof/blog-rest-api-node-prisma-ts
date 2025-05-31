import {OpenAPIV3} from "openapi-types";

export const categoryBodySchema: OpenAPIV3.RequestBodyObject = {
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
                example: {
                    name: "FinTech"
                }
            },
        },
    },
}

export const commentBodySchema: OpenAPIV3.SchemaObject = {
    type: "object",
    required: ["title"],
    properties: {
        title: {type: "string"},
        status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
        },
    }
}

export const postBodySchema: OpenAPIV3.RequestBodyObject = {
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
                        enum: ["DRAFT", "PUBLISHED", "DELETED", "ARCHIVED"],
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
}

export const profileBodySchema: OpenAPIV3.RequestBodyObject = {
    description: "JSON with profile data",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                required: ["bio"],
                properties: {
                    firstname: {type: "string"},
                    lastname: {type: "string"},
                    bio: {type: "string"},
                    picUrl: {type: "string"},
                },
            },
        },
    }
};

export const userBodySchemaAdminAction: OpenAPIV3.RequestBodyObject = {
    description: "JSON with user data",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: {type: "string"},
                    password: {type: "string"},
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
}

export const userBodyUpdateSchema: OpenAPIV3.RequestBodyObject = {
    description: "JSON with the updated user data",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                required: [],
                properties: {
                    email: {type: "string"},
                    password: { type: "string" },
                    isActive: {
                        type: "boolean",
                        default: true
                    }
                }
            }
        }
    }
}

export const userBodyUpdateSchemaAdminAction: OpenAPIV3.RequestBodyObject = {
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
}

export const postCreateBodySchema: OpenAPIV3.RequestBodyObject ={
        description: "JSON with the post data",
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["title", "description", "status", "categories"],
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
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
}



