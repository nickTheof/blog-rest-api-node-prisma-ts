import {OpenAPIV3} from "openapi-types";

export const apiSwaggerInfo: OpenAPIV3.InfoObject = {
    version: "1.0.0",
    title: "Blog App CRUD API",
    description:
        "An application for creating users, posts for different categories and creating comments for each post.",
    contact: {
        name: "API Support",
        url: "https://example.gr",
        email: "support@example.com",
    },
    license: {
        name: "MIT",
    }
}