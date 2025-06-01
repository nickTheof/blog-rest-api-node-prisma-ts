import request from "supertest";
import app from "../../app";
import userService from "../../service/user.service";
import authService from "../../service/auth.service";
import prisma from "../../prisma/client";
import {ApiErrorResponse, ApiPaginatedResponse, ApiResponse} from "../../utils/helpers/response.helpers";
import {Category, User} from "@prisma/client";
import {ca} from "zod/dist/types/v4/locales";
import {registerAndLogUser, UserHelperTestCredentials} from "../utils/authHelper";


describe("Category API Integration", () => {
    let adminToken: string;
    let editorToken: string;
    let userToken: string;

    beforeAll(async () => {
       const admin: UserHelperTestCredentials = await registerAndLogUser("ADMIN");
       const editor:UserHelperTestCredentials = await registerAndLogUser("EDITOR");
       const user:UserHelperTestCredentials = await registerAndLogUser("USER");
        ({token: adminToken} = admin);
        ({token: editorToken} = editor);
        ({token: userToken} = user);
    });

    afterAll(async () => {
        // Clean up, close DB connection
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    describe("POST /api/v1/categories", () => {

        it("admin should create a new category", async () => {
            const categoryName = "UniqueCat" + Date.now();
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: categoryName });
            const body: ApiResponse<Category> = response.body as ApiResponse<Category>;
            expect(response.status).toBe(201);
            expect(body.status).toBe("success");
            expect(body.data.name).toBe(categoryName);
        });

        it("editor should create a new category", async () => {
            const categoryName = "UniqueCat" + Date.now();
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: categoryName });
            const body: ApiResponse<Category> = response.body as ApiResponse<Category>;
            expect(response.status).toBe(201);
            expect(body.status).toBe("success");
            expect(body.data.name).toBe(categoryName);
        });

        it("should return 400 for invalid category name", async () => {
            const invalidName = "dd";
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: invalidName });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toContain("at least 3 characters");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .send({ name: "Test Category" });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 403 for user with USER role", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: "Test Category" });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 409 if category already exists", async () => {
            const categoryName = "UniqueCat" + Date.now();
            await prisma.category.create({ data: { name: categoryName } });
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: categoryName });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(409);
            expect(body.status).toBe("EntityAlreadyExists");
            expect(body.message).toContain("Duplicate entry on unique field");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })
    })

    describe("GET /api/v1/categories", () => {
        it("should return all categories for admin role", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiResponse<Category[]> = response.body as ApiResponse<Category[]>;
            expect(response.status).toBe(200);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.status).toBe("success")
            expect(body.results).toBe(body.data.length);
        });

        it("should return all categories for editor role", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${editorToken}`);
            const body: ApiResponse<Category[]> = response.body as ApiResponse<Category[]>;
            expect(response.status).toBe(200);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.status).toBe("success")
            expect(body.results).toBe(body.data.length);
        });

        it("should return all categories for user role", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${userToken}`);
            const body: ApiResponse<Category[]> = response.body as ApiResponse<Category[]>;
            expect(response.status).toBe(200);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.status).toBe("success")
            expect(body.results).toBe(body.data.length);
        });

        it("should return 400 for invalid query params", async () => {
            const invalidPage = "a";
            const invalidLimit = "a";
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    page: invalidPage,
                    limit: invalidLimit,
                });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(2);
            expect(body.errors[0]).toContain("must be a positive integer");
            expect(body.errors[1]).toContain("must be a positive integer");
        })

        it("should return paginated categories if paginated query param is true", async () => {
            const validPage = 1;
            const validLimit = 10;
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: validPage,
                    limit: validLimit,
                });
            const body: ApiPaginatedResponse<Category[]> = response.body as ApiPaginatedResponse<Category[]>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.currentPage).toBe(validPage);
            expect(body.limit).toBe(validLimit);
            expect(Array.isArray(body.data)).toBe(true);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);

        })
    })

    describe("GET /api/v1/categories/:id", () => {
        it("should get a category by id", async () => {
            const categoryName = "UniqueCat";
            const created = await prisma.category.create({ data: { name: categoryName } });
            const response = await request(app)
                .get(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiResponse<Category> = response.body as ApiResponse<Category>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.name).toBe(categoryName);
        });

        it("should return 404 for non-existing category", async () => {
            const catId = 999999;
            const response = await request(app)
                .get(`/api/v1/categories/${catId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(404)
            expect(body.status).toBe("EntityNotFound")
            expect(body.message).toContain(" not found");

        });

        it("should return 401 for unauthorized user", async () => {
            const catId = 999999;
            const response = await request(app)
                .get(`/api/v1/categories/${catId}`)
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 400 for invalid category id", async () => {
            const invalidId = "a";
            const response = await request(app)
                .get(`/api/v1/categories/${invalidId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(1);
        })
    })

    describe("PATCH /api/v1/categories/:id", () => {
        it("admin should update a category by id", async () => {
            const createName = "UpdateCat" + Date.now();
            const updateName = "AdminUpdatedCat" + Date.now();
            const created = await prisma.category.create({ data: { name: createName } });
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: updateName });
            const body: ApiResponse<Category> = response.body as ApiResponse<Category>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.name).toBe(updateName);
        })

        it("editor should update a category by id", async () => {
            const createName = "UpdateCat" + Date.now();
            const updateName = "AdminUpdatedCat" + Date.now();
            const created = await prisma.category.create({ data: { name: createName } });
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send({ name: updateName });
            const body: ApiResponse<Category> = response.body as ApiResponse<Category>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.data.name).toBe(updateName);
        })

        it("should return 400 for invalid category id", async () => {
            const invalidId = "a";
            const response = await request(app)
                .patch(`/api/v1/categories/${invalidId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "AdminUpdatedCat" });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(1);
        })

        it("should return 400 for invalid category name", async () => {
            const createName = "Cat" + Date.now();
            const invalidName = "dd";
            const created = await prisma.category.create({ data: { name: createName} });
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: invalidName});
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const catId = 999999;
            const response = await request(app)
                .patch(`/api/v1/categories/${catId}`)
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it('should return 403 for user with USER role', async () => {
            const createName = "Cat" + Date.now();
            const updateName = "UpdateCat" + Date.now();
            const created = await prisma.category.create({data: {name: createName}});
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: updateName });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })

        it("should return 404 for non-existing category", async () => {
            const catId = 999999;
            const response = await request(app)
                .patch( `/api/v1/categories/${catId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "AdminUpdatedCat" });
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(404)
            expect(body.status).toBe("EntityNotFound")
            expect(body.message).toContain(" not found");
        })
    })

    describe("DELETE /api/v1/categories/:id", () => {
        it("admin should delete a category by id", async () => {
            const createName = "DeleteCat" + Date.now();
            const created = await prisma.category.create({ data: { name: createName } });
            const response = await request(app)
                .delete(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
        })

        it("editor should delete a category by id", async () => {
            const createName = "DeleteCat" + Date.now();
            const created = await prisma.category.create({ data: { name: createName } });
            const response = await request(app)
                .delete(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${editorToken}`);
            expect(response.status).toBe(204);
            expect(response.text).toBe("");
        })

        it("should return 400 for invalid category id", async () => {
            const invalidId = "a";
            const response = await request(app)
                .delete(`/api/v1/categories/${invalidId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const catId = 999999;
            const response = await request(app)
                .delete(`/api/v1/categories/${catId}`)
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("EntityNotAuthorized");
            expect(body.message).toBe("No token provided");
            expect(body.errors.length).toBe(0);
        })

        it('should return 403 for user with USER role', async () => {
            const createName = "Cat" + Date.now();
            const created = await prisma.category.create({data: {name: createName}});
            const response = await request(app)
                .delete(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${userToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(403);
            expect(body.status).toBe("EntityForbiddenAction");
            expect(body.message).toBe("You are not authorized to perform this action");
            expect(body.errors.length).toBe(0);
        });

        it("should return 404 for non-existing category", async () => {
            const catId = 999999;
            const response = await request(app)
                .delete(`/api/v1/categories/${catId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(404);
            expect(body.status).toBe("EntityNotFound");
            expect(body.message).toContain(`with id ${catId} not found`);
            expect(body.errors.length).toBe(0);
        })
    });
});
