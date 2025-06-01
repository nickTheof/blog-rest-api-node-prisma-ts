import request from "supertest";
import prisma from "../../prisma/client";
import app from "../../app";
import userService from "../../service/user.service";
import profileService from "../../service/profile.service";
import {ProfileWithUser} from "../../types/response.types";
import {ApiErrorResponse, ApiPaginatedResponse, ApiResponse} from "../../utils/helpers/response.helpers";
import {registerWithProfileAndLog, UserHelperTestCredentials} from "../utils/authHelper";
import {Role} from "@prisma/client";
import {createProfileWithUser, invalidProfileData, updateProfileData} from "../utils/testData";
import {ProfileUpdateSchema} from "../../types/zod-schemas.types";

describe("Profile API Integration - Admin Routes", () => {
    let adminToken: string;
    let userToken: string;
    let editorToken: string;

    beforeAll(async () => {
        const admin: UserHelperTestCredentials = await registerWithProfileAndLog(Role.ADMIN);
        const editor:UserHelperTestCredentials = await registerWithProfileAndLog(Role.EDITOR);
        const user:UserHelperTestCredentials = await registerWithProfileAndLog(Role.USER);
        ({token: adminToken} = admin);
        ({token: editorToken} = editor);
        ({token: userToken} = user);
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
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get("/api/v1/profiles")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                });
            const body: ApiPaginatedResponse<ProfileWithUser[]> = response.body as  ApiPaginatedResponse<ProfileWithUser[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.totalItems).toBeGreaterThanOrEqual(3);
        })

        it("should return 400 for invalid query params", async () => {
            const invalidPage = "a";
            const invalidLimit = "a";
            const response = await request(app)
                .get("/api/v1/profiles")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    page: invalidPage,
                    limit: invalidLimit,
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
            profileCreated = await createProfileWithUser();
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
            expect(body.data.firstname).toBe(profileCreated.firstname);
            expect(body.data.lastname).toBe(profileCreated.lastname);
            expect(body.data.bio).toBe(profileCreated.bio);
            expect(body.data.user.email).toBe(profileCreated.user.email);
        })

        it("should return 400 for invalid path params", async () => {
            const invalidId = "a";
            const response = await request(app)
                .get(`/api/v1/profiles/${invalidId}`)
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
            const invalidId = "999999999";
            const response = await request(app)
                .get(`/api/v1/profiles/${invalidId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain(`with id ${invalidId} not found`);
            expect(body.errors.length).toBe(0);
        })
    })

    describe("PATCH /api/v1/profiles/:id", () => {
        let profileCreated: ProfileWithUser;
        beforeAll(async () => {
            profileCreated = await createProfileWithUser();
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
            const updatedData: ProfileUpdateSchema = updateProfileData;
            const response = await request(app)
                .patch(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updatedData);
            const body: ApiResponse<ProfileWithUser> = response.body as  ApiResponse<ProfileWithUser>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.firstname).toBe(updatedData.firstname);
            expect(body.data.lastname).toBe(updatedData.lastname);
            expect(body.data.bio).toBe(updatedData.bio);
            expect(body.data.user.email).toBe(profileCreated.user.email);
        })

        it("should return 400 for invalid path params", async () => {
            const invalidId = "a";
            const response = await request(app)
                .patch(`/api/v1/profiles/${invalidId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateProfileData)
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
                .send(invalidProfileData)
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(3);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch(`/api/v1/profiles/${profileCreated.id}`)
                .send(updateProfileData)
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
                .send(updateProfileData)
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
                .send(updateProfileData)
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for invalid profile id", async () => {
            const invalidId = "999999999";
            const response = await request(app)
                .patch(`/api/v1/profiles/${invalidId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateProfileData)
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain(`with id ${invalidId} not found`);
            expect(body.errors.length).toBe(0);
        })
    })

    describe("DELETE /api/v1/profiles/:id", () => {
        let profileCreated: ProfileWithUser;
        beforeAll(async () => {
            profileCreated = await createProfileWithUser();
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
        it("should delete a profile by id", async () => {
            const response = await request(app)
                .delete(`/api/v1/profiles/${profileCreated.id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(204);
            expect(response.text).toBe("");

        })

        it("should return 400 for invalid path params", async () => {
            const invalidId = "a";
            const response = await request(app)
                .delete(`/api/v1/profiles/${invalidId}`)
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
            const invalidId = "999999999";
            const response = await request(app)
                .delete(`/api/v1/profiles/${invalidId}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body: ApiErrorResponse = response.body as  ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain(`with id ${invalidId} not found`);
            expect(body.errors.length).toBe(0);
        })
    })
})