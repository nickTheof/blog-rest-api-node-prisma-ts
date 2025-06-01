import request from 'supertest';
import prisma from "../../prisma/client";
import app from "../../app";
import {ApiErrorResponse, ApiResponse} from "../../utils/helpers/response.helpers";
import {Role, User} from "@prisma/client";
import { generateRoleEmailTest, USER_PASSWORD} from "../setup/utils/testmockdata";


const ADMIN_EMAIL_TEST = generateRoleEmailTest(Role.ADMIN);

describe('Auth API Integration Tests', () => {
    describe('POST /api/v1/auth/login', () => {
        it("should return 200 and a token for valid credentials", async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: ADMIN_EMAIL_TEST,
                    password: USER_PASSWORD
                })
            const body: ApiResponse<null> = response.body as ApiResponse<null>;
            expect(response.status).toBe(200);
            expect(body.status).toBe("success");
            expect(body.token).toBeDefined();
            expect(typeof body.token).toBe("string");
        })

        it("should return 401 for invalid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "fake@mail.com",
                    password: USER_PASSWORD
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("error");
            expect(body.message).toBe("Invalid credentials");
            expect(body.errors).toBeUndefined()
        })

        it("should return 401 for invalid email", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "fake@mail",
                    password: USER_PASSWORD
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("error");
            expect(body.message).toContain("Invalid credentials");
            expect(body.errors).toBeUndefined()
        })

        it("should return 401 for invalid password", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: ADMIN_EMAIL_TEST,
                    password: "aA!1234"
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(401);
            expect(body.status).toBe("error");
            expect(body.message).toContain("Invalid credentials")
            expect(body.errors).toBeUndefined()
        })
    })

    describe('POST /api/v1/auth/register', () => {
        it("should return 201 for successful registration", async () => {
            const registerEmail = `testuser${Date.now()}@mail.com`;
            const registerDTO = {
                email: registerEmail,
                password: USER_PASSWORD,
                confirmPassword: USER_PASSWORD
            }
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(registerDTO)
            const body: ApiResponse<User> = response.body as ApiResponse<User>;
            expect(response.status).toBe(201);
            expect(body.status).toBe("success");
            expect(body.data).toBeDefined();
            expect(body.data.email).toBe(registerEmail)
            // Clean the created user
            await prisma.user.delete({ where: { id: body.data.id } });
        })

        it("should return 400 for invalid email", async () => {
            const invalidEmail = "testuser";
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: invalidEmail,
                    password: USER_PASSWORD,
                    confirmPassword: USER_PASSWORD
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
            expect(body.errors[0]).toContain("not valid format");
        })

        it("should return 400 for passwords dont match", async () => {
            const validEmail = `testuser${Date.now()}@mail.com`
            const confirmPassword = USER_PASSWORD+Date.now();
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: validEmail,
                    password: USER_PASSWORD,
                    confirmPassword: confirmPassword
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(1);
            expect(body.errors[0]).toContain("don't match");
        })

        it("should return 400 for invalid password format", async () => {
            const validEmail = `testuser${Date.now()}@mail.com`
            const password = "aaaaaaaaa";
            const confirmPassword = "aaaaaaaa";
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: validEmail,
                    password: password,
                    confirmPassword: confirmPassword
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(400);
            expect(body.status).toBe("ValidationError");
            expect(body.message).toContain("Invalid input")
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBeGreaterThan(1)
        })

        it("should return 409 for existing email", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: ADMIN_EMAIL_TEST,
                    password: USER_PASSWORD,
                    confirmPassword: USER_PASSWORD
                })
            const body: ApiErrorResponse = response.body as ApiErrorResponse;
            expect(response.status).toBe(409);
            expect(body.status).toBe("EntityAlreadyExists");
            expect(body.message).toContain("Duplicate entry on unique field");
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBe(0);
        })
    })

})