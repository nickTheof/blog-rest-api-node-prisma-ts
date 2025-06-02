import request from 'supertest';
import app from "../../app";
import {createToken, insertProfile, insertUser} from "../setup/utils/data.helper";
import {Category, Post, PostStatus, Role, User} from "@prisma/client";
import {ApiErrorResponse, ApiPaginatedResponse, ApiResponse} from "../../utils/helpers/response.helpers";
import {createPostData, createProfileData, generateRoleEmailTest} from "../setup/utils/testmockdata";
import prisma from "../../prisma/client";
import {
    PostCreateSchema,
    PostUpdateSchema,
    ProfileCreateSchema,
    ProfileUpdateSchema
} from "../../types/zod-schemas.types";
import {ProfileWithUser} from "../../types/response.types";
import postService from "../../service/post.service";


describe('User API Integration - Current Authenticated User Routes', () => {
    let userToken: string;
    let adminToken: string;
    let editorToken: string;
    let userWithoutProfileToken: string;

    beforeAll(async () => {
        userToken = await createToken(Role.USER);
        adminToken = await createToken(Role.ADMIN);
        editorToken = await createToken(Role.EDITOR);
        userWithoutProfileToken = await createToken(Role.USER, "5");
    })

    describe('GET /api/v1/users/me', () => {
        it("should return 200 and user data for valid token of user role", async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization',`Bearer ${userToken}`);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.email).toBe(generateRoleEmailTest(Role.USER));
            expect(body.data.role).toBe(Role.USER);
            expect(body.data.uuid).toBeDefined();
        })

        it("should return 200 and user data for valid token of admin role", async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization',`Bearer ${adminToken}`);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
        })

        it("should return 200 and user data for valid token of editor role", async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization',`Bearer ${editorToken}`);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization',`Bearer ${invalidToken}`);
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
        })

        it("should return 401 for no token", async () => {
            const response = await request(app)
                .get('/api/v1/users/me');
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
        })
    })

    describe('PATCH /api/v1/users/me', () => {

        it("should return 200 and user data for valid token of user role", async () => {
            const userToInsert: User = await insertUser(Role.USER, true, "100");
            const token = await createToken(Role.USER, "100");
            const response = await request(app)
                .patch("/api/v1/users/me")
                .set('Authorization',`Bearer ${token}`)
                .send({
                    isActive: false
                })
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.email).toBe(userToInsert.email);
            expect(body.data.role).toBe(userToInsert.role);
            expect(body.data.uuid).toBe(userToInsert.uuid);
            expect(body.data.isActive).toBeFalsy()
            // Clear the state
            await prisma.user.delete({
                where: {
                    email: userToInsert.email
                }
            })
        })
        it('should return 400 for invalid patch data', async() => {
            const response = await request(app)
                .patch("/api/v1/users/me")
                .set('Authorization',`Bearer ${editorToken}`)
                .send({
                    status: "a"
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });

        it('should return 401 for invalid token', async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .patch('/api/v1/users/me')
                .set('Authorization',`Bearer ${invalidToken}`)
                .send({
                    email: "testmail@mail.com",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
            expect(body.errors.length).toBe(0);
        });

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch('/api/v1/users/me')
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it('should return 409 if there is conflict in update email', async() => {
            const response = await request(app)
                .patch("/api/v1/users/me")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    email: generateRoleEmailTest(Role.ADMIN)
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(409);
            expect(body.status).toBe("EntityAlreadyExists");
            expect(body.message).toContain("Duplicate entry on unique field");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });
    })

    describe('DELETE /api/v1/users/me', () => {
        it("should return 204 for valid token of user role", async () => {
            const userToInsert: User = await insertUser(Role.USER, true, "10000");
            const token = await createToken(Role.USER, "10000");
            const response = await request(app)
                .delete("/api/v1/users/me")
                .set('Authorization',`Bearer ${token}`)
            const body = response.body as ApiResponse<User>;
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
            // Clear the state
            await prisma.user.delete({
                where: {
                    email: userToInsert.email
                }
            })
        })

        it('should return 401 for invalid token', async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .delete('/api/v1/users/me')
                .set('Authorization',`Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it('should return 401 for unauthorized user', async () => {
            const response = await request(app)
                .delete('/api/v1/users/me')
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })
    })

    describe("GET /api/v1/users/me/posts", () => {
        let user: User;
        beforeAll(async () => {
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
        })
        it("should return 200 and user posts for valid token of user role", async () => {
            const response = await request(app)
                .get('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${userToken}`);
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.every(post => post.authorId === user.id));
        })

        it("should return paginated user posts if paginated query param is true", async () => {
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${userToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                })
            const body = response.body as ApiPaginatedResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.every(post => post.authorId === user.id));
        })

        it("should return filtered user posts if status query param is provided", async () => {
            const validStatus = PostStatus.PUBLISHED;
            const response = await request(app)
                .get('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${userToken}`)
                .query({
                    status: validStatus,
                })
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.every(post => post.authorId === user.id && post.status === validStatus));
        })

        it("should return filtered user posts if multiple status query params are provided", async () => {
            const status1 = PostStatus.PUBLISHED;
            const status2 = PostStatus.DRAFT;
            const response = await request(app)
                .get(`/api/v1/users/me/posts?status=${status1}&status=${status2}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiResponse<Post[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.every(post => post.authorId === user.id && (post.status === status1 || post.status === status2)));
        })

        it("should return 400 for invalid query params", async () => {
            const invalidPage = "a";
            const invalidLimit = "a";
            const response = await request(app)
                .get('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${userToken}`)
                .query({
                    paginated: true,
                    page: invalidPage,
                    limit: invalidLimit,
                })
            const body = response.body as ApiErrorResponse;
        })

        it("should return 400 for invalid query filter status param", async () => {
            const invalidStatus = "a";
            const response = await request(app)
                .get('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${userToken}`)
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

        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .get('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get('/api/v1/users/me/posts')
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })
    })

    describe("POST /api/v1/users/me/posts", () => {
        let category: Category;
        beforeAll(async () => {
            category = await prisma.category.findFirst() as Category;
        })

        it("should return 201 and created post for valid token of user role", async () => {
            const createdPost: PostCreateSchema = createPostData(PostStatus.PUBLISHED, [category.id]);
            const response = await request(app)
                .post('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${userToken}`)
                .send(createdPost);
            const body = response.body as ApiResponse<Post>;
            expect(response.status).toBe(201);
            expect(body.status).toBe("success");
            expect(body.data.title).toBe(createdPost.title);
            expect(body.data.status).toBe(createdPost.status);
            expect(body.data.description).toBe(createdPost.description);
        })

        it("should return 400 for invalid post data", async () => {
            const response = await request(app)
                .post('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${userToken}`)
                .send({
                    title: "a",
                    description: "a",
                    status: "a",
                    categories: []
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for invalid token", async () => {
            const createdPost: PostCreateSchema = createPostData(PostStatus.PUBLISHED, [category.id]);
            const invalidToken = "invalidToken";
            const response = await request(app)
                .post('/api/v1/users/me/posts')
                .set('Authorization',`Bearer ${invalidToken}`)
                .send(createdPost)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it('should return 401 for missing token', async () => {
            const createdPost: PostCreateSchema = createPostData(PostStatus.PUBLISHED, [category.id]);
            const response = await request(app)
                .post('/api/v1/users/me/posts')
                .send(createdPost)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });
    })

    describe("GET /api/v1/users/me/posts/:uuid", () => {
        let post: Post;
        beforeAll(async () => {
            const user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
            post = await prisma.post.findFirst({
                where: {
                    authorId: user.id
                }
            }) as Post;
        })

        it("should return 200 and post for valid token of user role", async () => {
            const response = await request(app)
                .get(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiResponse<Post>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.title).toBe(post.title);
            expect(body.data.status).toBe(post.status);
            expect(body.data.description).toBe(post.description);
        })

        it("should return 400 for invalid uuid", async () => {
            const invalidUuid = "invalidUuid";
            const response = await request(app)
                .get(`/api/v1/users/me/posts/${invalidUuid}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .get(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get(`/api/v1/users/me/posts/${post.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for post not found", async () => {
            const uuid = "55555555-5555-5555-5555-555555555555";
            const response = await request(app)
                .get(`/api/v1/users/me/posts/${uuid}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })

        it("should return 404 for post that exists but belongs to another user", async () => {
            const response = await request(app)
                .get(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("PATCH /api/v1/users/me/posts/:uuid", () => {
        let post: Post;
        let user: User;
        beforeAll(async () => {
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
            post = await prisma.post.findFirst({
                where: {
                    authorId: user.id
                }
            }) as Post;
        })

        it("should return 200 and updated post for valid token of user role", async () => {
            const postToUpdate: Post = await postService.create(user.uuid, createPostData(PostStatus.PUBLISHED, []));
            const updatedPost: PostUpdateSchema = {
                status: "ARCHIVED"
            }
            const response = await request(app)
                .patch(`/api/v1/users/me/posts/${postToUpdate.uuid}`)
                .set('Authorization',`Bearer ${userToken}`)
                .send(updatedPost)
            console.log(response.body);
            const body = response.body as ApiResponse<Post>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.status).toBe(updatedPost.status);
            // clear the state
            await postService.deleteByUuid(postToUpdate.uuid);
        })

        it("should return 400 for invalid uuid", async () => {
            const invalidUuid = "invalidUuid";
            const response = await request(app)
                .patch(`/api/v1/users/me/posts/${invalidUuid}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 400 for invalid post data", async () => {
            const response = await request(app)
                .patch(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${userToken}`)
                .send({
                    title: "a",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .patch(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch(`/api/v1/users/me/posts/${post.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
        })

        it("should return 404 for post not found", async () => {
            const uuid = "55555555-5555-5555-5555-555555555555";
            const response = await request(app)
                .patch(`/api/v1/users/me/posts/${uuid}`)
                .set('Authorization',`Bearer ${userToken}`)
                .send({
                    title: "updatedTitle",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })

        it("should return 404 for post that exists but belongs to another user", async () => {
            const response = await request(app)
                .patch(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${editorToken}`)
                .send({
                    title: "updatedTitle",
                })
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("DELETE /api/v1/users/me/posts/:uuid", () => {
        let user: User;
        let post: Post;
        beforeAll(async () => {
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
            post = await prisma.post.findFirst({
                where: {
                    authorId: user.id
                }
            }) as Post;
        })


        it("should return 204 and deleted post for valid token of user role", async () => {
            const postToDelete: Post = await postService.create(user.uuid, createPostData(PostStatus.PUBLISHED, []));
            const response = await request(app)
                .delete(`/api/v1/users/me/posts/${postToDelete.uuid}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiResponse<Post>;
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
            // clear the state as the previous test do soft delete
            await postService.deleteByUuid(postToDelete.uuid);

        })

        it("should return 400 for invalid uuid", async () => {
            const invalidUuid = "invalidUuid";
            const response = await request(app)
                .delete(`/api/v1/users/me/posts/${invalidUuid}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .delete(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .delete(`/api/v1/users/me/posts/${post.uuid}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
        })

        it("should return 404 for post not found", async () => {
            const uuid = "55555555-5555-5555-5555-555555555555";
            const response = await request(app)
                .delete(`/api/v1/users/me/posts/${uuid}`)
                .set('Authorization',`Bearer ${userToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })

        it("should return 404 for post that exists but belongs to another user", async () => {
            const response = await request(app)
                .delete(`/api/v1/users/me/posts/${post.uuid}`)
                .set('Authorization',`Bearer ${editorToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("GET /api/v1/users/me/profile", () => {
        let user: User;
        beforeAll(async () => {
            user = await prisma.user.findUnique({
                where: {
                    email: generateRoleEmailTest(Role.USER)
                }
            }) as User;
        })
        it("should return 200 and user profile for valid token of user role", async () => {
            const response = await request(app)
                .get("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${userToken}`)
            const body = response.body as ApiResponse<ProfileWithUser>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.user.email).toBe(user.email);
            expect(body.data.user.role).toBe(user.role);
            expect(body.data.user.uuid).toBe(user.uuid);
            expect(body.data.user.isActive).toBe(user.isActive);
            expect(body.data.user.createdAt).toBe(user.createdAt.toISOString());
            expect(body.data.user.updatedAt).toBe(user.updatedAt.toISOString());
        })

        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .get("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
        })

        it('should return 401 for missing token', async() => {
            const response = await request(app)
                .get("/api/v1/users/me/profile")
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });

        it("should return 404 for user without profile", async () => {
            const response = await request(app)
                .get("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${userWithoutProfileToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain("not found");
        })
    })

    describe("POST /api/v1/users/me/profile", () => {
        let userWithoutProfile: User;
        beforeAll(async () => {
            userWithoutProfile = await prisma.user.findFirst({
                where: {
                    email: generateRoleEmailTest(Role.USER, "5")
                }
            }) as User;
        })

        it("should return 201 and created profile for valid token of user role", async () => {
            const response = await request(app)
                .post("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${userWithoutProfileToken}`)
                .send(createProfileData);
            const body = response.body as ApiResponse<ProfileWithUser>;
            expect(response.status).toBe(201);
            expect(body.status).toBe("success");
            expect(body.data.user.email).toBe(userWithoutProfile.email);
            expect(body.data.bio).toBe(createProfileData.bio);
            // clear the profile
            await prisma.profile.delete({
                where: {
                    userId: userWithoutProfile.id
                }
            })
        })

        it('should return 400 for invalid profile data', async () => {
            const invalidProfileData: ProfileCreateSchema = {
                firstname: "a",
                bio: "a",
                lastname: "a",
            }
            const response = await request(app)
                .post("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${userWithoutProfileToken}`)
                .send(invalidProfileData)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        });

        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .post("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${invalidToken}`)
                .send(createProfileData)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it('should return 401 for missing token', async() => {
            const response = await request(app)
                .post("/api/v1/users/me/profile")
                .send(createProfileData)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        });

        it('should return 409 for duplicate profile', async() => {
            const response = await request(app)
                .post("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(createProfileData)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(409);
            expect(body.status).toBe("EntityAlreadyExists");
        })
    })

    describe("PATCH /api/v1/users/me/profile", () => {
        it("should return 200 and updated profile for valid token of user role", async () => {
           const updatedProfileData: ProfileUpdateSchema = {
               bio: "updatedBio"
           }
           const response = await request(app)
               .patch("/api/v1/users/me/profile")
               .set("Authorization", `Bearer ${userToken}`)
               .send(updatedProfileData)
           const body = response.body as ApiResponse<ProfileWithUser>;
           expect(response.status).toBe(200);
           expect(body.status).toBe("success");
           expect(body.data.bio).toBe(updatedProfileData.bio);
           expect(body.data.user.email).toBe(generateRoleEmailTest(Role.USER));
        })

        it("should return 400 for invalid profile data", async () => {
            const invalidProfileData: ProfileUpdateSchema = {
                bio: "a",
            }
            const response = await request(app)
                .patch("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${userToken}`)
                .send(invalidProfileData)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
        })
        it("should return 401 for invalid token", async () => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .patch("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        })

        it("should return 401 for missing token", async () => {
            const response = await request(app)
                .patch("/api/v1/users/me/profile")
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 if profile doesn't exist", async () => {
            const updatedProfileData: ProfileUpdateSchema = {
                bio: "updatedBio"
            }
            const response = await request(app)
                .patch("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${userWithoutProfileToken}`)
                .send(updatedProfileData)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
        })
    })

    describe("DELETE /api/v1/users/me/profile", () => {
        it("should return 204 and deleted profile for valid token of user role", async () => {
            const userToInsert: User = await insertUser(Role.USER, true, "10001");
            await insertProfile(userToInsert.uuid);
            const token = await createToken(Role.USER, "10001");
            const response = await request(app)
                .delete("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${token}`)
            const body = response.body as ApiResponse<ProfileWithUser>;
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
            // clear the profile
            await prisma.user.delete({
                where: {
                    email: userToInsert.email
                }
            })
        })

        it('should return 401 for invalid token', async() => {
            const invalidToken = "invalidToken";
            const response = await request(app)
                .delete("/api/v1/users/me/profile")
                .set("Authorization", `Bearer ${invalidToken}`)
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("Token is not valid");
        });

        it("should return 401 for missing token", async () => {
            const response = await request(app)
                .delete("/api/v1/users/me/profile")
            const body = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })
    })
})