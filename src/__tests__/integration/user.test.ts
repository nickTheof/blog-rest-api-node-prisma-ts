import request from "supertest";
import app from "../../app";
import {Post, PostStatus, Role, User} from "@prisma/client";
import {
    insertUser,
    createToken
} from "../setup/utils/data.helper";
import {ApiErrorResponse, ApiResponse, ApiPaginatedResponse} from "../../utils/helpers/response.helpers";
import prisma from "../../prisma/client";
import {CreateUserSchema, UpdateUserSchema} from "../../types/zod-schemas.types";
import { createUserData, generateRoleEmailTest} from "../setup/utils/testmockdata";

describe("User API Integration", () => {
    let adminToken: string;
    let editorToken: string;
    let userToken: string;

    beforeAll(async () => {
        adminToken = await createToken(Role.ADMIN);
        editorToken = await createToken(Role.EDITOR);
        userToken = await createToken(Role.USER);
    })

    describe("GET /api/v1/users", () => {
        it("should return all users for admin role", async () => {
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiResponse<User[]>;
            expect(response.status).toBe(200);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.status).toBe("success")
            expect(body.results).toBe(body.data.length);
            expect(body.data.length).toBeGreaterThanOrEqual(4);
        })

        it("should return paginated users if paginated query param is true", async () => {
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                })
            const body = response.body as ApiPaginatedResponse<User[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.totalItems).toBeGreaterThanOrEqual(4);
        })

        it("should return only active users if active query param is true", async () => {
            const isActive = true;
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    isActive: isActive,
                })
            const body = response.body as ApiResponse<User[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.results).toBe(body.data.length);
            expect(body.data.length).toBeGreaterThanOrEqual(3)
        })

        it("should return only inactive users if active query param is true", async () => {
            const isActive = false;
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    isActive: isActive,
                })
            const body = response.body as  ApiResponse<User[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.results).toBe(body.data.length);
            expect(body.data.length).toBeGreaterThanOrEqual(1);
        })

        it("should return 400 for invalid query params", async () => {
            const invalidPage = "a";
            const invalidLimit = "a";
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    page: invalidPage,
                    limit: invalidLimit,
                })
            const body = response.body as  ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(2);
            expect(body.errors[0]).toContain("must be a positive integer");
            expect(body.errors[1]).toContain("must be a positive integer");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get("/api/v1/users")
            const body = response.body as  ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${editorToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it('should return 403 for user role', async () => {
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${userToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });
    })

    describe("POST /api/v1/users", () => {
        const userToCreate: CreateUserSchema = createUserData(Role.USER, true, Date.now().toString());

        it("should create a new user", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(userToCreate);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(201);
            expect(body.status).toBe("success");
            expect(body.data.email).toBe(userToCreate.email);
            expect(body.data.role).toBe(userToCreate.role);
            expect(body.data.isActive).toBe(userToCreate.isActive);
            // Clear the user from the database
            await prisma.user.deleteMany({
                where: {
                    email: userToCreate.email
                }
            })
        })

        it("should return 400 for invalid input", async () => {
            const invalidInput = {
                email: "a",
                password: "1234567890",
            }
            const response = await request(app)
                .post("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidInput);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBeGreaterThanOrEqual(1)
            expect(body.errors[0]).toContain("has not valid format");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .send(userToCreate);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it('should return 403 for editor role', async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .set("Authorization", `Bearer ${editorToken}`)
                .send(userToCreate);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });


        it('should return 403 for user role', async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .set("Authorization", `Bearer ${userToken}`)
                .send(userToCreate);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });

        it ("should return 409 for duplicate email", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(createUserData(Role.USER));
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(409);
            expect(body.status).toBe("EntityAlreadyExists");
            expect(body.message).toContain("Duplicate entry on unique field");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })
    })

    describe("GET /api/v1/users/:uuid", () => {
        let editor: User;
        let admin: User;

        beforeAll(async () => {
            admin = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.ADMIN)
                }
            }) as User;
            editor = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.EDITOR)
                }
            }) as User;
        })
        it("should return a user by uuid for admin role", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${editor.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.id).toBe(editor.id.toString());
            expect(body.data.email).toBe(editor.email);
            expect(body.data.role).toBe(editor.role);
        })

        it("should return 400 for invalid uuid", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .get(`/api/v1/users/${invalidUuid}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
            expect(body.errors[0]).toContain("Invalid UUID format");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${editor.uuid}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${admin.uuid}`)
                .set("Authorization", `Bearer ${editorToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${admin.uuid}`)
                .set("Authorization", `Bearer ${userToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it('should return 404 for user not found', async () => {
            const uuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .get(`/api/v1/users/${uuid}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
            expect(Array.isArray(body.errors)).toBe(true);
        });
    })

    describe("PATCH /api/v1/users/:uuid", () => {
        const EMAIL_TO_UPDATE = `test${Role.USER}2@test.com`
        let userToUpdate: User;
        const updatedUserSchema: UpdateUserSchema = {
            email: EMAIL_TO_UPDATE,
            role: Role.EDITOR,
        }


        beforeAll(async () => {
            userToUpdate = await prisma.user.findUnique({
                where: {
                    email: EMAIL_TO_UPDATE
                }
            }) as User;
        })

        it("should update a user by uuid for admin role", async () => {
            const response = await request(app)
                .patch(`/api/v1/users/${userToUpdate.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updatedUserSchema);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.id).toBe(userToUpdate.id.toString());
            expect(body.data.email).toBe(updatedUserSchema.email);
        })

        it("should return 400 for invalid uuid", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .patch(`/api/v1/users/${invalidUuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updatedUserSchema);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
            expect(body.errors[0]).toContain("Invalid UUID format");
        })

        it("should return 400 for invalid input", async () => {
            const invalidInput = {
                role: "a",
            }
            const response = await request(app)
                .patch(`/api/v1/users/${userToUpdate.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidInput);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBeGreaterThanOrEqual(1)
            expect(body.errors[0]).toContain("Invalid enum value");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch(`/api/v1/users/${userToUpdate.uuid}`)
                .send(updatedUserSchema);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .patch(`/api/v1/users/${userToUpdate.uuid}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send(updatedUserSchema);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .patch(`/api/v1/users/${userToUpdate.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send(updatedUserSchema);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for user not found", async () => {
            const uuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .patch(`/api/v1/users/${uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updatedUserSchema);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })

        it("should return 409 for duplicate email", async () => {
            const invalidInput = {
                email: generateRoleEmailTest(Role.ADMIN),
            }
            const response = await request(app)
                .patch(`/api/v1/users/${userToUpdate.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidInput);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(409);
            expect(body.status).toBe("EntityAlreadyExists");
            expect(body.message).toContain("Duplicate entry on unique field");
        })
    })

    describe("DELETE /api/v1/users/:uuid", () => {
        let user: User;
        beforeAll(async () => {
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
        })

        it("should delete a user by uuid for admin role", async () => {
            const toDeleteUser = await insertUser(Role.USER, true, Date.now().toString())
            const response = await request(app)
                .delete(`/api/v1/users/${toDeleteUser.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
        })

        it('should return 400 for invalid uuid', async() => {
            const invalidUuid = "a";
            const response = await request(app)
                .delete(`/api/v1/users/${invalidUuid}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
            expect(body.errors[0]).toContain("Invalid UUID format");
        });

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${user.uuid}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${user.uuid}`)
                .set("Authorization", `Bearer ${editorToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${user.uuid}`)
                .set("Authorization", `Bearer ${userToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for user not found", async () => {
            const uuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .delete(`/api/v1/users/${uuid}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("GET /api/v1/users/:uuid/posts", () => {
        let adminToken: string;
        let editorToken: string;
        let userToken: string;
        let user: User;

        beforeAll(async () => {
            adminToken = await createToken(Role.ADMIN);
            editorToken = await createToken(Role.EDITOR);
            userToken = await createToken(Role.USER);
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
        })


        it('should return all posts of a user with a specific valid uuid', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.length).toBeGreaterThanOrEqual(2);
            expect(body.data[0].authorId).toBe(user.id.toString());
            expect(body.data[1].authorId).toBe(user.id.toString());
        });

        it("should return all posts paginated of a user with a specific valid uuid", async () => {
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts`)
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                });
            const body = response.body as ApiPaginatedResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.limit).toBe(validLimit);
            expect(body.currentPage).toBe(validPage);
            expect(body.totalPages).toBe(1);
            expect(body.totalItems).toBeGreaterThanOrEqual(2);
            expect(body.data[0].authorId).toBe(user.id.toString());
            expect(body.data[1].authorId).toBe(user.id.toString());
        })

        it("should return only posts with the respected query status of a user with a specific valid uuid", async () => {
            const filterPosts = PostStatus.PUBLISHED;
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts?status=${filterPosts}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    status: filterPosts,
                });
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(post => post.status === filterPosts))
        })

        it("should apply multiple values for post status query and return the posts of the user with a specific valid uuid", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts?status=${PostStatus.PUBLISHED}&status=${PostStatus.DRAFT}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(post => post.status === PostStatus.PUBLISHED || post.status === PostStatus.DRAFT))
        })

        it("should return 400 for invalid uuid", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .get(`/api/v1/users/${invalidUuid}/posts`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 400 for invalid query status", async () => {
            const invalidStatus = "a";
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts`)
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    status: invalidStatus,
                });
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
            expect(body.errors[0]).toContain("Invalid input");
        })

        it("should return 400 for invalid query pagination", async () => {
            const invalidPage = "a";
            const invalidLimit = "a";
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts`)
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: invalidPage,
                    limit: invalidLimit,
                });
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(2);
            expect(body.errors[0]).toContain("must be a positive integer");
            expect(body.errors[1]).toContain("must be a positive integer");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts`)
                .set("Authorization", `Bearer ${editorToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user.uuid}/posts`)
                .set("Authorization", `Bearer ${userToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
        })

        it("should return 404 for user not found", async () => {
            const uuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .get(`/api/v1/users/${uuid}/posts`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })
})