import request from "supertest";
import prisma from "../../prisma/client";
import app from "../../app";
import userService from "../../service/user.service";
import profileService from "../../service/profile.service";
import authService from "../../service/auth.service";
import {ProfileWithUser} from "../../types/response.types";
import {ApiErrorResponse, ApiPaginatedResponse, ApiResponse} from "../../utils/helpers/response.helpers";

describe("Profile API Integration - Admin Routes", () => {
    let adminToken: string;
    let userToken: string;
    let editorToken: string;
    let response: { status: string, data: string };


    beforeAll(async () => {
        const admin = await userService.create({
            email: "admin@test.com",
            password: "aA@12345",
            role: "ADMIN",
            isActive: true,
        })
        const editor = await userService.create({
            email: "editor@test.com",
            password: "aA@12345",
            role: "EDITOR",
            isActive: true,
        })
        const user = await userService.create({
            email: "user@test.com",
            password: "aA@12345",
            role: "USER",
            isActive: true,
        })
        await profileService.create(admin.uuid, {
            firstname: "Admin",
            lastname: "Test",
            bio: "Admin Test Bio",
        })
        await profileService.create(editor.uuid, {
            firstname: "Editor",
            lastname: "Test",
            bio: "Editor Test Bio",
        })
        await profileService.create(user.uuid, {
            firstname: "User",
            lastname: "Test",
            bio: "User Test Bio",
        })
        response = await authService.loginUser({
            email: "admin@test.com",
            password: "aA@12345"
        }) as { status: string, data: string };
        adminToken = response.data;
        response = await authService.loginUser({
            email: "editor@test.com",
            password: "aA@12345"
        }) as { status: string, data: string };
        editorToken = response.data;
        response = await authService.loginUser({
            email: "user@test.com",
            password: "aA@12345"
        }) as { status: string, data: string };
        userToken = response.data;
    })

    afterAll(async () => {
        await prisma.profile.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    })

    describe("GET /api/v1/profiles", () => {
        it("should return all profiles for admin role", async () => {
            const response = await request(app)
                .get("/api/v1/profiles")
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiResponse<ProfileWithUser[]> = response.body as  ApiResponse<ProfileWithUser[]>;
            expect(response.status).toBe(200);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.status).toBe("success")
            expect(body.data.length).toBe(3);
        })

        it("should return paginated profiles if paginated query param is true", async () => {
            const response = await request(app)
                .get("/api/v1/profiles")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: 1,
                    limit: 10,
                });
            const body: ApiPaginatedResponse<ProfileWithUser[]> = response.body as  ApiPaginatedResponse<ProfileWithUser[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.currentPage).toBe(1);
            expect(body.limit).toBe(10);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.totalItems).toBe(3);
        })

        it("should return 400 for invalid query params", async () => {
            const response = await request(app)
                .get("/api/v1/profiles")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    page: "a",
                    limit: "a",
                });
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
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
                .get("/api/v1/profiles")
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get("/api/v1/profiles")
                .set("Authorization", `Bearer ${editorToken}`);
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get("/api/v1/profiles")
                .set("Authorization", `Bearer ${userToken}`);
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })
    })

    describe("GET /api/v1/profiles/:id", () => {
        let profileCreated: ProfileWithUser;
        beforeAll(async () => {
            const userCreated = await userService.create({
                email: "test@test.com",
                password: "aA@12345",
                role: "USER",
                isActive: true,
            })
            profileCreated = await profileService.create(userCreated.uuid, {
                firstname: "Test",
                lastname: "Test",
                bio: "Test Test Bio",
            })
        })
        afterAll(async() => {
            await prisma.profile.deleteMany({
                where: {
                    id: profileCreated.id
                }
            });
            await prisma.user.deleteMany({
                where: {
                    id: profileCreated.userId
                }
            })
        })
        it("admin should get a profile by id with user info", async () => {
            const response = await request(app)
                .get(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiResponse<ProfileWithUser> = response.body as  ApiResponse<ProfileWithUser>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.firstname).toBe("Test");
            expect(body.data.lastname).toBe("Test");
            expect(body.data.bio).toBe("Test Test Bio");
            expect(body.data.user.email).toBe("test@test.com")
        })

        it("should return 400 for invalid path params", async () => {
            const response = await request(app)
                .get(`/api/v1/profiles/aaaa`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/profiles/${profileCreated.id}`)
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("editor should get 403 unauthorized", async () => {
            const response = await request(app)
                .get(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${editorToken}`);
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("user should get 403 unauthorized", async () => {
            const response = await request(app)
                .get(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${userToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for invalid profile id", async () => {
            const response = await request(app)
                .get(`/api/v1/profiles/99999`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("with id 99999 not found");
            expect(body.errors.length).toBe(0);
        })
    })

    describe("PATCH /api/v1/profiles/:id", () => {
        let profileCreated: ProfileWithUser;
        beforeAll(async () => {
            const userCreated = await userService.create({
                email: "test@test.com",
                password: "aA@12345",
                role: "USER",
                isActive: true,
            })
            profileCreated = await profileService.create(userCreated.uuid, {
                firstname: "Test",
                lastname: "Test",
                bio: "Test Test Bio",
            })
        })
        afterAll(async() => {
            await prisma.profile.deleteMany({
                where: {
                    id: profileCreated.id
                }
            });
            await prisma.user.deleteMany({
                where: {
                    id: profileCreated.userId
                }
            })
        })
        it("admin should update a profile by id", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    firstname: "Updated Name",
                    lastname: "Updated Lastname",
                    bio: "Updated Bio",
                });
            const body: ApiResponse<ProfileWithUser> = response.body as  ApiResponse<ProfileWithUser>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.firstname).toBe("Updated Name");
            expect(body.data.lastname).toBe("Updated Lastname");
            expect(body.data.bio).toBe("Updated Bio");
            expect(body.data.user.email).toBe("test@test.com");
        })

        it("should return 400 for invalid path params", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/aaaa`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    firstname: "Updated Name",
                    lastname: "Updated Lastname",
                    bio: "Updated Bio",
                })
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 400 for invalid profile data", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    bio: "",
                })
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/${profileCreated.id}`)
                .send({
                    firstname: "Updated Name",
                    lastname: "Updated Lastname",
                    bio: "Updated Bio",
                })
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send({
                    firstname: "Updated Name",
                    lastname: "Updated Lastname",
                    bio: "Updated Bio",
                })
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    firstname: "Updated Name",
                    lastname: "Updated Lastname",
                    bio: "Updated Bio",
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for invalid profile id", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/99999`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    firstname: "Updated Name",
                    lastname: "Updated Lastname",
                    bio: "Updated Bio",
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("with id 99999 not found");
            expect(body.errors.length).toBe(0);
        })
    })

    describe("DELETE /api/v1/profiles/:id", () => {
        let profileCreated: ProfileWithUser;
        beforeEach(async () => {
            const userCreated = await userService.create({
                email: "test@test.com",
                password: "aA@12345",
                role: "USER",
                isActive: true,
            })
            profileCreated = await profileService.create(userCreated.uuid, {
                firstname: "Test",
                lastname: "Test",
                bio: "Test Test Bio",
            })
        })
        afterEach(async() => {
            await prisma.profile.deleteMany({
                where: {
                    id: profileCreated.id
                }
            });
            await prisma.user.deleteMany({
                where: {
                    id: profileCreated.userId
                }
            })
        })
        it("should delete a profile by id", async () => {
            const response = await request(app)
                .delete(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(204);
            expect(response.text).toBe("");

        })

        it("should return 400 for invalid path params", async () => {
            const response = await request(app)
                .delete(`/api/v1/profiles/aaaa`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .delete(`/api/v1/profiles/${profileCreated.id}`)
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .delete(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${editorToken}`);
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .delete(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${userToken}`);
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for invalid profile id", async () => {
            const response = await request(app)
                .delete(`/api/v1/profiles/999999999999`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("with id 999999999999 not found");
            expect(body.errors.length).toBe(0);
        })
    })
})