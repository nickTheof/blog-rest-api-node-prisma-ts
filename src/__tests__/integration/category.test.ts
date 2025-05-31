import request from "supertest";
import app from "../../app";
import userService from "../../service/user.service";
import authService from "../../service/auth.service";
import prisma from "../../prisma/client";


describe("Category API Integration", () => {
    let adminToken: string;
    let userToken: string;
    let editorToken: string;
    let response: { status: string, data: string };

    beforeAll(async () => {
        await userService.create({
            email: "admin@test.com",
            password: "aA@12345",
            role: "ADMIN",
            isActive: true,
        })
        response = await authService.loginUser({
            email: "admin@test.com",
            password: "aA@12345"
        }) as { status: string, data: string };
        adminToken = response.data;
        await userService.create({
            email: "editor@test.com",
            password: "aA@12345",
            role: "EDITOR",
            isActive: true,
        })
        response = await authService.loginUser({
            email: "editor@test.com",
            password: "aA@12345"
        }) as { status: string, data: string };
        editorToken = response.data;
        await userService.create({
            email: "user@test.com",
            password: "aA@12345",
            role: "USER",
            isActive: true,
        })
        response = await authService.loginUser({
            email: "user@test.com",
            password: "aA@12345"
        }) as { status: string, data: string };
        userToken = response.data;

    });

    afterAll(async () => {
        // Clean up, close DB connection
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    describe("POST /api/v1/categories", () => {

        it("admin should create a new category", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Test Category" });
            expect(response.status).toBe(201);
            expect(response.body.status).toBe("success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.name).toBe("Test Category");
        });

        it("editor should create a new category", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Editor Test Category" });
            expect(response.status).toBe(201);
            expect(response.body.status).toBe("success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.name).toBe("Editor Test Category");
        });

        it("should return 400 for invalid category name", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "dd" });
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toContain("at least 3 characters");
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .send({ name: "Test Category" });
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("EntityNotAuthorized");
            expect(response.body.message).toBe("No token provided");
        })

        it("should return 403 for user with USER role", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: "Test Category" });
            expect(response.status).toBe(403);
            expect(response.body.status).toBe("EntityForbiddenAction");
            expect(response.body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 409 if category already exists", async () => {
            const response = await request(app)
                .post("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Test Category" });
            expect(response.status).toBe(409);
            expect(response.body.status).toBe("EntityAlreadyExists");
            expect(response.body.message).toContain("Duplicate entry on unique field");
        })
    })

    describe("GET /api/v1/categories", () => {
        it("should return all categories for admin role", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.status).toBe("success")
            expect(response.body.results).toBe(response.body.data.length);
        });

        it("should return all categories for editor role", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${editorToken}`);
            expect(response.status).toBe(200);
        });

        it("should return all categories for user role", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${userToken}`);
            expect(response.status).toBe(200);
        });

        it("should return 400 for invalid query params", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    page: "a",
                    limit: "a",
                });
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(2);
            expect(response.body.errors[0]).toContain("must be a positive integer");
            expect(response.body.errors[1]).toContain("must be a positive integer");
        })

        it("should return paginated categories if paginated query param is true", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .query({
                    paginated: true,
                    page: 1,
                    limit: 10,
                });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
            expect(response.body.currentPage).toBe(1);
            expect(response.body.limit).toBe(10);
            expect(Array.isArray(response.body.data)).toBe(true);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get("/api/v1/categories")
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("EntityNotAuthorized");
            expect(response.body.message).toBe("No token provided");
        })
    })

    describe("GET /api/v1/categories/:id", () => {
        it("should get a category by id", async () => {
            // Create a category first
            const created = await prisma.category.create({ data: { name: "UniqueCat" } });
            const response = await request(app)
                .get(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
            expect(response.body.data.name).toBe("UniqueCat");
        });

        it("should return 404 for non-existing category", async () => {
            const response = await request(app)
                .get("/api/v1/categories/999999")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(404)
            expect(response.body.status).toBe("EntityNotFound")
        });

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .get("/api/v1/categories/999999")
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("EntityNotAuthorized");
            expect(response.body.message).toBe("No token provided");
        })

        it("should return 400 for invalid category id", async () => {
            const response = await request(app)
                .get("/api/v1/categories/a")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
        })
    })

    describe("PATCH /api/v1/categories/:id", () => {
        it("admin should update a category by id", async () => {
            // Create a category first
            const created = await prisma.category.create({ data: { name: "UpdateCat" } });
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "AdminUpdatedCat" });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
            expect(response.body.data.name).toBe("AdminUpdatedCat");
        })

        it("editor should update a category by id", async () => {
            // Create a category first
            const created = await prisma.category.create({ data: { name: "EditorUpdateCat" } });
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send({ name: "EditorUpdatedCat" });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
            expect(response.body.data.name).toBe("EditorUpdatedCat");
        })

        it("should return 400 for invalid category id", async () => {
            const response = await request(app)
                .patch("/api/v1/categories/a")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "AdminUpdatedCat" });
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
        })

        it("should return 400 for invalid category name", async () => {
            // Create a category first
            const created = await prisma.category.create({ data: { name: "InvalidCat" } });
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "dd" });
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(1);
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .patch("/api/v1/categories/999999")
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("EntityNotAuthorized");
            expect(response.body.message).toBe("No token provided");
        })

        it('should return 403 for user with USER role', async () => {
            // Create a category first
            const created = await prisma.category.create({data: {name: "UserUpdateCat"}});
            const response = await request(app)
                .patch(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: "UserUpdatedCat" });
            expect(response.status).toBe(403);
            expect(response.body.status).toBe("EntityForbiddenAction");
            expect(response.body.message).toBe("You are not authorized to perform this action");
        })

        it("should return 404 for non-existing category", async () => {
            const response = await request(app)
                .patch("/api/v1/categories/999999")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "AdminUpdatedCat" });
            expect(response.status).toBe(404)
            expect(response.body.status).toBe("EntityNotFound")
        })
    })

    describe("DELETE /api/v1/categories/:id", () => {
        it("admin should delete a category by id", async () => {
            // Create a category first
            const created = await prisma.category.create({ data: { name: "DeleteCat" } });
            const response = await request(app)
                .delete(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(204);
        })

        it("editor should delete a category by id", async () => {
            // Create a category first
            const created = await prisma.category.create({ data: { name: "DeleteCat" } });
            const response = await request(app)
                .delete(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${editorToken}`);
            expect(response.status).toBe(204);
        })

        it("should return 400 for invalid category id", async () => {
            const response = await request(app)
                .delete("/api/v1/categories/a")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
        })

        it("should return 401 for unauthorized user", async () => {
            const response = await request(app)
                .delete("/api/v1/categories/999999")
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("EntityNotAuthorized");
            expect(response.body.message).toBe("No token provided");
        })

        it('should return 403 for user with USER role', async () => {
            // Create a category first
            const created = await prisma.category.create({data: {name: "DeleteCat"}});
            const response = await request(app)
                .delete(`/api/v1/categories/${created.id}`)
                .set("Authorization", `Bearer ${userToken}`);
            expect(response.status).toBe(403);
            expect(response.body.status).toBe("EntityForbiddenAction");
            expect(response.body.message).toBe("You are not authorized to perform this action");
        });

        it("should return 404 for non-existing category", async () => {
            const response = await request(app)
                .delete("/api/v1/categories/999999")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(404)
            expect(response.body.status).toBe("EntityNotFound")
        })
    });
});
