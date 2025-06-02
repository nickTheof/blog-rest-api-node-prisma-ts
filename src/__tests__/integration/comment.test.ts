import request from "supertest";
import app from "../../app";
import {createToken} from "../setup/utils/data.helper";
import {Comment, CommentStatus, Post, Role, User} from "@prisma/client";
import {ApiErrorResponse, ApiPaginatedResponse, ApiResponse} from "../../utils/helpers/response.helpers";
import prisma from "../../prisma/client";
import {CommentWithAuthorAndPost} from "../../types/response.types";
import commentService from "../../service/comment.service";
import {createCommentData} from "../setup/utils/testmockdata";

describe('Comment API Integration Tests - Admin Routes', () => {
    let userToken: string;
    let editorToken: string;
    let adminToken: string;

    beforeAll(async () => {
        userToken = await createToken(Role.USER);
        editorToken = await createToken(Role.EDITOR);
        adminToken = await createToken(Role.ADMIN);
    })

    describe('GET /api/v1/comments', () => {
        it("should return all comments for admin role", async () => {
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${adminToken}`);
            const body = response.body as ApiResponse<Comment[]>;
            expect(response.status).toBe(200);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.status).toBe("success")
            expect(body.data.length).toBeGreaterThanOrEqual(3);
            expect(body.results).toBe(body.data.length);
        })

        it("should return paginated comments if paginated query param is true", async () => {
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                })
            const body = response.body as ApiPaginatedResponse<Comment[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.totalItems).toBeGreaterThanOrEqual(body.data.length);
        })

        it("should return comments based on status if status query param is defined", async () => {
            const validStatus: CommentStatus = CommentStatus.ACTIVE;
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    status: validStatus,
                })
            const body = response.body as ApiResponse<Comment[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(comment => comment.status === validStatus)).toBe(true);
        })

        it("should return comments based on multiple statuses if status query param is defined", async () => {
            const validStatus1: CommentStatus = CommentStatus.ACTIVE;
            const validStatus2: CommentStatus = CommentStatus.INACTIVE;
            const response = await request(app)
                .get(`/api/v1/comments?status=${validStatus1}&status=${validStatus2}`)
                .set('Authorization', `Bearer ${adminToken}`)

            const body = response.body as ApiResponse<Comment[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(comment => comment.status === validStatus1 || comment.status === validStatus2)).toBe(true);
        })

        it("should return 400 for invalid query params", async () => {
            const invalidPage = "a";
            const invalidLimit = "a";
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: invalidPage,
                    limit: invalidLimit,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(2);
        })

        it("should return 400 for invalid status query param", async () => {
            const invalidStatus = "a";
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    status: invalidStatus,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get('/api/v1/comments')
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 401 for not valid token", async () => {
            const invalidToken = "invalid";
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get('/api/v1/comments')
                .set('Authorization', `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
        })
    })

    describe("GET /api/v1/comments/:uuid", () => {
        let comment: Comment;

        beforeAll(async () => {
            comment = await prisma.comment.findFirst() as Comment;
        })

        it("should return 200 and comment based on uuid for admin role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<CommentWithAuthorAndPost>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.uuid).toBe(comment.uuid);
            expect(body.data.author.id).toBe(comment.userId.toString());
        })

        it("should return 400 for invalid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .get(`/api/v1/comments/${invalidUuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/${comment.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 401 for not valid token", async () => {
            const invalidToken = "invalid";
            const response = await request(app)
                .get(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })
        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 if uuid is valid and comment does not exist", async () => {
            const uuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .get(`/api/v1/comments/${uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("PATCH /api/v1/comments/:uuid", () => {
        let comment: Comment;
        beforeAll(async () => {
            const user: User = await prisma.user.findFirst() as User;
            const post = await prisma.post.findFirst() as Post;
            comment = await commentService.create(user.uuid, post.uuid, createCommentData())
        })

        afterAll(async () => {
            await commentService.deleteById(comment.id);
        })

        it("should return 200 and updated comment for admin role", async () => {
            const response = await request(app)
                .patch(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: CommentStatus.PENDING,
                })
            const body = response.body as ApiResponse<CommentWithAuthorAndPost>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.uuid).toBe(comment.uuid);
            expect(body.data.status).toBe(CommentStatus.PENDING);
        })

        it("should return 400 for invalid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .patch(`/api/v1/comments/${invalidUuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: CommentStatus.PENDING,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 400 for invalid status", async () => {
            const response = await request(app)
                .patch(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: "a",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it('should return 401 for invalid token', async() => {
            const invalidToken = "invalid";
            const response = await request(app)
                .patch(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${invalidToken}`)
                .send({
                    status: CommentStatus.PENDING,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        });

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch(`/api/v1/comments/${comment.uuid}`)
                .send({
                    status: CommentStatus.PENDING,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .patch(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${editorToken}`)
                .send({
                    status: CommentStatus.PENDING,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .patch(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    status: CommentStatus.PENDING,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 if uuid is valid and comment does not exist", async () => {
            const uuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .patch(`/api/v1/comments/${uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: CommentStatus.PENDING,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("DELETE /api/v1/comments/:uuid", () => {
        let comment: Comment;
        beforeAll(async () => {
            const user: User = await prisma.user.findFirst() as User;
            const post = await prisma.post.findFirst() as Post;
            comment = await commentService.create(user.uuid, post.uuid, createCommentData())
        })

        it("should return 204 and deleted comment for admin role", async () => {
            const response = await request(app)
                .delete(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .delete(`/api/v1/comments/${comment.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 401 for not valid token", async () => {
            const invalidToken = "invalid";
            const response = await request(app)
                .delete(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .delete(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .delete(`/api/v1/comments/${comment.uuid}`)
                .set('Authorization', `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })

        it('should return 404 for valid uuid but comment not exists', async () => {
            const validUuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .delete(`/api/v1/comments/${validUuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        });
    })

    describe("GET /api/v1/comments/user/:uuid", () => {
        let user: User;
        beforeAll(async () => {
            user = await prisma.user.findFirst() as User;
        })

        it("should return 200 and comments for user for admin role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.length).toBeGreaterThan(0);
        })

        it("should return 200 and paginated comments for user for admin role", async () => {
            const validPage = 1;
            const validLimit = 1;
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                })
            const body = response.body as ApiPaginatedResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.length).toBeGreaterThan(0);
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
        })

        it("should return 200 and filter comments based on the status of the comment for admin role", async () => {
            const validStatus = CommentStatus.ACTIVE;
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    status: validStatus,
                })
            const body = response.body as ApiResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(comment => comment.status === validStatus)).toBe(true);
        })

        it("should return 200 and filter comments based on multiple statuses of the comment for admin role", async () => {
            const validStatus1 = CommentStatus.ACTIVE;
            const validStatus2 = CommentStatus.PENDING;
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}?status=${validStatus1}&${validStatus2}`)
                .set('Authorization', `Bearer ${adminToken}`)
            console.log(response.body)
            const body = response.body as ApiResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(comment => comment.status === validStatus1 || comment.status === validStatus2)).toBe(true);
        })

        it("should return 400 for invalid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .get(`/api/v1/comments/user/${invalidUuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 401 for not valid token", async () => {
            const invalidToken = "invalid";
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}`)
                .set('Authorization', `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}`)
                .set('Authorization', `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/user/${user.uuid}`)
                .set('Authorization', `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 if user does not exist", async () => {
            const invalidUuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .get(`/api/v1/comments/user/${invalidUuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe(" GET /api/v1/comments/post/:uuid", () => {
        let post: Post;
        beforeAll(async () => {
            post = await prisma.post.findFirst() as Post;
        })
        it("should return 200 and comments for post for admin role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.length).toBeGreaterThan(0);
        })

        it("should return 200 and paginated comments for post for admin role", async () => {
            const validPage = 1;
            const validLimit = 1;
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                })
            const body = response.body as ApiPaginatedResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
            expect(body.data).toBeDefined();
        })

        it("should return 200 and filter comments based on the status of the comment for admin role", async () => {
            const validStatus = CommentStatus.ACTIVE;
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    status: validStatus,
                })
            const body = response.body as ApiResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(comment => comment.status === validStatus)).toBe(true);
        })
        it("should return 200 and filter comments based on multiple statuses of the comment for admin role", async () => {
            const validStatus1 = CommentStatus.ACTIVE;
            const validStatus2 = CommentStatus.PENDING;
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}?status=${validStatus1}&${validStatus2}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<CommentWithAuthorAndPost[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.every(comment => comment.status === validStatus1 || comment.status === validStatus2)).toBe(true);
        })

        it("should return 400 for invalid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .get(`/api/v1/comments/post/${invalidUuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 401 for not valid token", async () => {
            const invalidToken = "invalid";
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}`)
                .set('Authorization', `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}`)
                .set('Authorization', `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get(`/api/v1/comments/post/${post.uuid}`)
                .set('Authorization', `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 404 if post does not exist", async () => {
            const validUuid = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .get(`/api/v1/comments/post/${validUuid}`)
                .set('Authorization', `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })


    })
});