import request from 'supertest';
import prisma from "../../prisma/client";
import userService from "../../service/user.service";
import app from "../../app";

describe('Auth API Integration Tests', () => {
    beforeAll(async() => {
        await userService.create({
            email: "test@mail.com",
            password: "aA!12345",
            role: "USER",
            isActive: true,
        })
    })

    afterAll(async() => {
          await prisma.user.deleteMany();
          await prisma.$disconnect();
    })

    describe('POST /api/v1/auth/login', () => {
        it("should return 200 and a token for valid credentials", async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: "test@mail.com",
                    password: "aA!12345"
                })
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
            expect(response.body.token).toBeDefined();
            expect(typeof response.body.token).toBe("string");
        })

        it("should return 401 for invalid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "fake@mail.com",
                    password: "aA!12345"
                })
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Invalid credentials");
        })

        it("should return 401 for invalid email", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "fake@mail",
                    password: "aA!12345"
                })
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
            expect(response.body.message).toContain("Invalid credentials");
        })

        it("should return 401 for invalid password", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "test@mail.com",
                    password: "aA!1234"
                })
            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
            expect(response.body.message).toContain("Invalid credentials")
        })
    })

    describe('POST /api/v1/auth/register', () => {
        it("should return 201 for successful registration", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "testuser@mail.com",
                    password: "aA!12345",
                    confirmPassword: "aA!12345"
                })
            expect(response.status).toBe(201);
            expect(response.body.status).toBe("success");
            expect(response.body.data).toBeDefined();
            expect(response.body.data.email).toBe("testuser@mail.com")
        })

        it("should return 400 for invalid email", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "testuser",
                    password: "aA!12345",
                    confirmPassword: "aA!12345"
                })
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toContain("not valid format");
        })

        it("should return 400 for passwords dont match", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "testuser@mail.com",
                    password: "aA!12345",
                    confirmPassword: "aA!123456"
                })
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toContain("don't match");
        })

        it("should return 400 for invalid password format", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "testuser@mail.com",
                    password: "aaaaaaaa",
                    confirmPassword: "aaaaaaaa"
                })
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("ValidationError");
            expect(response.body.message).toContain("Invalid input")
            expect(Array.isArray(response.body.errors)).toBe(true);
        })

        it("should return 409 for existing email", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "test@mail.com",
                    password: "aA!12345",
                    confirmPassword: "aA!12345"
                })
            expect(response.status).toBe(409);
            expect(response.body.status).toBe("EntityAlreadyExists");
            expect(response.body.message).toContain("Duplicate entry on unique field");
        })
    })

})