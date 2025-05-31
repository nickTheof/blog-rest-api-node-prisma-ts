import {OpenAPIV3} from "openapi-types";

const localServer: OpenAPIV3.ServerObject = {
    url: "http://localhost:3000",
    description: "Local Server",
}

export const serversSwagger: OpenAPIV3.ServerObject[] = [
    localServer
];