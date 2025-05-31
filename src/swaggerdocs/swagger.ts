import {OpenAPIV3} from 'openapi-types';
import {swaggerTags} from "./tags.swagger";
import {components} from "./components.swagger";
import {apiSwaggerInfo} from "./info-object.swagger";
import {serversSwagger} from "./servers.swagger";
import {authSwaggerPaths} from "./paths/auth.swagger";
import {categoriesSwaggerPaths} from "./paths/categories.swagger";
import {usersSwaggerPaths} from "./paths/users.swagger";
import {postsSwaggerPaths} from "./paths/posts.swagger";
import {commentsSwaggerPaths} from "./paths/comments.swagger";
import {profilesSwaggerPaths} from "./paths/profiles.swagger";


export const swaggerOptions: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: apiSwaggerInfo,
    servers: serversSwagger,
    components,
    tags: swaggerTags,
    paths: {
        ...authSwaggerPaths,
        ...categoriesSwaggerPaths,
        ...usersSwaggerPaths,
        ...profilesSwaggerPaths,
        ...postsSwaggerPaths,
        ...commentsSwaggerPaths,
    }
}
