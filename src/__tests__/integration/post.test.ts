import request from "supertest";
import app from "../../app";
import prisma from "../../prisma/client";
import {Post, PostStatus, Role, User} from "@prisma/client";
import {ApiErrorResponse, ApiPaginatedResponse, ApiResponse} from "../../utils/helpers/response.helpers";
import {createToken} from "../setup/utils/data.helper";
import {CommentWithAuthor} from "../../types/response.types";
import {generateRoleEmailTest} from "../setup/utils/testmockdata";
import commentService from "../../service/comment.service";


describe("Post API Integration - Admin Routes", () => {
    let adminToken: string;
    let editorToken: string;
    let userToken: string;

    beforeAll(async () => {
        adminToken = await createToken(Role.ADMIN);
        editorToken = await createToken(Role.EDITOR);
        userToken = await createToken(Role.USER);
    })

    describe("GET /api/v1/posts", () => {
        it("should return all posts for admin role", async () => {
            const response = await request(app)
                .get("/api/v1/posts")
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.results).toBeGreaterThanOrEqual(6);
            expect(body.results).toBe(body.data.length);
        })

        it("should return all posts paginated for admin role", async () => {
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get("/api/v1/posts")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                })
            const body = response.body as ApiPaginatedResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.totalItems).toBeGreaterThanOrEqual(6);
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
        })

        it("should return posts with status filter for admin role", async () => {
            const validStatus = PostStatus.PUBLISHED;
            const response = await request(app)
                .get("/api/v1/posts")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    status: validStatus,
                })
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.results).toBeGreaterThanOrEqual(1);
            expect(body.results).toBe(body.data.length);
            expect(body.data.every(post => post.status === validStatus)).toBe(true);
        })

        it("should return posts with multiple status filters for admin role", async () => {
            const status1 = PostStatus.PUBLISHED;
            const status2 = PostStatus.DRAFT;
            const response = await request(app)
                .get(`/api/v1/posts?status=${status1}&status=${status2}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.results).toBe(body.data.length);
            expect(body.data.every(post => post.status === status1 || post.status === status2)).toBe(true);
        })

        it("should return 400 for invalid query params", async () => {
            const invalidPage = "a";
            const invalidLimit = "a";
            const response = await request(app)
                .get("/api/v1/posts")
                .set("Authorization", `Bearer ${adminToken}`)
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
            expect(body.errors[0]).toContain("must be a positive integer");
            expect(body.errors[1]).toContain("must be a positive integer");
        })

        it("should return 400 for invalid query filter status param", async () => {
            const invalidStatus = "a";
            const response = await request(app)
                .get("/api/v1/posts")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    status: invalidStatus,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
            expect(body.errors[0]).toContain("Invalid input");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get("/api/v1/posts")
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get("/api/v1/posts")
                .set("Authorization", `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get("/api/v1/posts")
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })
    })

    describe("GET /api/v1/posts/:uuid", () => {
        let postToGet: Post;

        beforeAll(async () => {
            postToGet = await prisma.post.findFirst() as Post;
        })

        it('should get the post by uuid for admin', async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${postToGet.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<Post>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.title).toBe(postToGet.title);
            expect(body.data.description).toBe(postToGet.description);
            expect(body.data.status).toBe(postToGet.status);
            expect(body.data.createdAt).toBe(postToGet.createdAt.toISOString());
            expect(body.data.updatedAt).toBe(postToGet.updatedAt.toISOString());
        });

        it("should return 400 for invalid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .get(`/api/v1/posts/${invalidUuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${postToGet.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${postToGet.uuid}`)
                .set("Authorization", `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${postToGet.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for not found post based on uuid", async () => {
            const uuid = "12345678-1234-1234-1234-123456789012";
            const response = await request(app)
                .get(`/api/v1/posts/${uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("PATCH /api/v1/posts/:uuid", () => {
        let postToUpdate: Post;

        beforeAll(async () => {
            const user: User = await prisma.user.findFirst() as User;
            postToUpdate = await prisma.post.create({
                data: {
                    title: "Test Post",
                    description: "Test Post Description",
                    status: PostStatus.DRAFT,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    authorId: user.id,
                }
            }) as Post;
        })

        afterAll(async () => {
            await prisma.post.deleteMany({
                where: {
                    id: postToUpdate.id
                }
            })
        })

        it('should update the post based on uuid for admin', async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${postToUpdate.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    title: "Updated Post",
                    description: "Updated Post Description",
                    status: PostStatus.PUBLISHED,
                })
            const body = response.body as ApiResponse<Post>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.title).toBe("Updated Post");
            expect(body.data.description).toBe("Updated Post Description");
            expect(body.data.status).toBe(PostStatus.PUBLISHED);
            expect(body.data.createdAt).toBe(postToUpdate.createdAt.toISOString());
            expect(body.data.updatedAt).not.toBe(postToUpdate.updatedAt.toISOString());
        });

        it('should return 400 for invalid path uuid', async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .patch(`/api/v1/posts/${invalidUuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    status: PostStatus.PUBLISHED,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        });

        it("should return 400 for invalid patch data", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${postToUpdate.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
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

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${postToUpdate.uuid}`)
                .send({
                    status: PostStatus.PUBLISHED,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${postToUpdate.uuid}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send({
                    status: PostStatus.PUBLISHED,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${postToUpdate.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    status: PostStatus.PUBLISHED,
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })
    })

    describe("DELETE /api/v1/posts/:uuid", () => {
        let postToDelete: Post;

        beforeAll(async () => {
            const user: User = await prisma.user.findFirst() as User;
            postToDelete = await prisma.post.create({
                data: {
                    title: "Test Post",
                    description: "Test Post Description",
                    status: PostStatus.DRAFT,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    authorId: user.id,
                }
            }) as Post;
        })

        it('should delete the post based on uuid for admin', async () => {
            const response = await request(app)
                .delete(`/api/v1/posts/${postToDelete.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiResponse<Post>;
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
        })

        it("should return 400 for invalid path uuid", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .delete(`/api/v1/posts/${invalidUuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .delete(`/api/v1/posts/${postToDelete.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for editor role", async () => {
            const response = await request(app)
                .delete(`/api/v1/posts/${postToDelete.uuid}`)
                .set("Authorization", `Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 403 for user role", async () => {
            const response = await request(app)
                .delete(`/api/v1/posts/${postToDelete.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 404 for not found post based on uuid", async () => {
            const uuid = "12345678-1234-1234-1234-123456789012";
            const response = await request(app)
                .delete(`/api/v1/posts/${uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("GET /api/v1/posts/:uuid/comments", () => {
        let post: Post;
        beforeAll(async () => {
            post = await prisma.post.findFirst() as Post;
        })

        it("should return 200 and get all comments for a specific post for authenticated user", async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiResponse<CommentWithAuthor[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data).toBeDefined();
        })

        it("should return 200 and get all comments for a specific post for admin", async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${adminToken}`)
            expect(response.status).toBe(200);
        })

        it("should return 200 and get all comments for a specific post for editor", async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${editorToken}`)
            expect(response.status).toBe(200);
        })

        it('should return 200 and get all paginated comments for a specific posts', async() => {
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    page: validPage,
                    limit: validLimit,
                })
            const body = response.body as ApiResponse<CommentWithAuthor[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data).toBeDefined();
            expect(body.data.every(comment => comment.postId.toString() === post.id.toString())).toBe(true)
        });

        it("should return 400 for invalid query params", async () => {
            const invalidPage = -1;
            const invalidLimit = -1;
            const response = await request(app)
                .get(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${userToken}`)
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

        it("should return 400 for invalid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .get(`/api/v1/posts/${invalidUuid}/comments`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/posts/${post.uuid}/comments`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "<PASSWORD>";
            const response = await request(app)
                .get(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 404 for not found post based on uuid", async () => {
            const invalidUuid = "12345678-1234-1234-1234-123456789012";
            const response = await request(app)
                .get(`/api/v1/posts/${invalidUuid}/comments`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("POST /api/v1/posts/:uuid/comments", () => {
        let post: Post;
        beforeAll(async () => {
            post = await prisma.post.findFirst() as Post;
        })

        it("should return 201 and create a comment for a specific post for authenticated user", async () => {
            const response = await request(app)
                .post(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Test Comment",
                })
            const body = response.body as ApiResponse<CommentWithAuthor>;
            expect(response.status).toBe(201);
            expect(body.status).toBe("success");
            expect(body.data).toBeDefined();
            expect(body.data.title).toBe("Test Comment");
            expect(body.data.postId).toBe(post.id.toString());
            expect(body.data.author.email).toBe(generateRoleEmailTest(Role.USER));
            // clear the state
            await prisma.comment.delete({
                where: {
                    id: body.data.id
                }
            })
        })

        it("should return 400 for invalid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .post(`/api/v1/posts/${invalidUuid}/comments`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Test Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
        })

        it("should return 400 for invalid body", async () => {
            const response = await request(app)
                .post(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "",
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
                .post(`/api/v1/posts/${post.uuid}/comments`)
                .send({
                    title: "Test Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "<PASSWORD>";
            const response = await request(app)
                .post(`/api/v1/posts/${post.uuid}/comments`)
                .set("Authorization", `Bearer ${invalidToken}`)
                .send({
                    title: "Test Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })
        it("should return 404 for not found post based on uuid", async () => {
            const invalidUuid = "12345678-1234-1234-1234-123456789012";
            const response = await request(app)
                .post(`/api/v1/posts/${invalidUuid}/comments`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Test Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("PATCH /api/v1/posts/:uuid/comments/:commentUuid", () => {
        let post: Post;
        let user: User;
        let comment: CommentWithAuthor;
        beforeAll(async () => {
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
            post = await prisma.post.findFirst() as Post;
            comment = await commentService.create(user.uuid, post.uuid, {
                title: "Test Comment",
            })
        })

        afterAll(async () => {
            await prisma.comment.delete({
                where: {
                    id: comment.id
                }
            })
        })

        it("should return 200 and update the comment based on uuid for authenticated user", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Updated Comment",
                })
            const body = response.body as ApiResponse<CommentWithAuthor>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data).toBeDefined();
            expect(body.data.title).toBe("Updated Comment");
            expect(body.data.postId).toBe(post.id.toString());
            expect(body.data.author.email).toBe(generateRoleEmailTest(Role.USER));
        })

        it("should return 400 for invalid  post uuid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .patch(`/api/v1/posts/${invalidUuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Updated Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 400 for invalid comment uuid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .patch(`/api/v1/posts/${post.uuid}/comments/${invalidUuid}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Updated Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 400 for invalid body", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .send({
                    title: "Updated Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "<PASSWORD>";
            const response = await request(app)
                .patch(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${invalidToken}`)
                .send({
                    title: "Updated Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 404 for not found comment based on uuid", async () => {
            const invalidUuid = "12345678-1234-1234-1234-123456789012";
            const response = await request(app)
                .patch(`/api/v1/posts/${post.uuid}/comments/${invalidUuid}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Updated Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })

        it("should return 403 if comment exists but not belong to the authenticated user", async () => {
            const response = await request(app)
                .patch(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    title: "Updated Comment",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toContain("not found");
        })
    })

    describe("DELETE /api/v1/posts/:uuid/comments/:commentUuid", () => {
        let post: Post;
        let user: User;
        let comment: CommentWithAuthor;
        beforeAll(async () => {
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
            post = await prisma.post.findFirst() as Post;
            comment = await commentService.create(user.uuid, post.uuid, {
                title: "Test Comment",
            })
        })


        it("should return 403 if comment exists but not belong to the authenticated user", async () => {
            const response = await request(app)
                .delete(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${adminToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
        })

        it("should return 200 and delete the comment based on uuid for authenticated user", async () => {
            const response = await request(app)
                .delete(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
        })

        it("should return 400 for invalid  post uuid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .delete(`/api/v1/posts/${invalidUuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 400 for invalid comment uuid path params", async () => {
            const invalidUuid = "a";
            const response = await request(app)
                .delete(`/api/v1/posts/${post.uuid}/comments/${invalidUuid}`)
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .delete(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "<PASSWORD>";
            const response = await request(app)
                .delete(`/api/v1/posts/${post.uuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 404 for not found comment based on uuid", async () => {
            const invalidUuid = "12345678-1234-1234-1234-123456789012";
            const response = await request(app)
                .delete(`/api/v1/posts/${post.uuid}/comments/${invalidUuid}`)
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })

        it("should return 404 for not found post based on uuid", async () => {
            const invalidUuid = "12345678-1234-1234-1234-123456789012";
            const response = await request(app)
                .delete(`/api/v1/posts/${invalidUuid}/comments/${comment.uuid}`)
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })

    })

})