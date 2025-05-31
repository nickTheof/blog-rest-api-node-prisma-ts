import {OpenAPIV3} from "openapi-types";

const authTag: OpenAPIV3.TagObject = {
    name: 'Authentication',
    description: "Endpoints for Authentication",
}

const categoriesTag: OpenAPIV3.TagObject = {
    name: 'Categories',
    description: 'Endpoints for Categories'
}

const commentsTag: OpenAPIV3.TagObject = {
    name: "Comments",
    description: "Endpoints for Comments",
}

const postsTag: OpenAPIV3.TagObject = {
    name: 'Posts',
    description: 'Endpoints for Posts'
}

const profilesTag: OpenAPIV3.TagObject = {
    name: 'Profiles',
    description: 'Endpoints for routes'
}

const usersTag: OpenAPIV3.TagObject = {
    name: 'Users',
    description: 'Endpoints for users'
}

const adminTag: OpenAPIV3.TagObject = {
    name: 'Admin',
    description: 'Endpoints for Admin'
}

const meTag: OpenAPIV3.TagObject = {
    name: 'Me - Current User',
    description: 'Endpoints for Current Authenticated User'
}



export const swaggerTags: OpenAPIV3.TagObject[] = [
    authTag,
    categoriesTag,
    commentsTag,
    postsTag,
    profilesTag,
    usersTag,
    adminTag
]