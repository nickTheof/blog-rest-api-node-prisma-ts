import {
    CategorySchema, CommentCreateSchema,
    CreateUserSchema,
    PostCreateSchema, ProfileCreateSchema,
    ProfileUpdateSchema,
    UpdateUserSchema
} from "../../../types/zod-schemas.types";
import {CommentStatus, PostStatus, Role} from "@prisma/client";


export const USER_PASSWORD = "aA!12345";
export const generateRoleEmailTest = (role: Role, random: string = "") => `test${role}${random}@test.com`

export const createProfileData: ProfileCreateSchema = {
    firstname: "Test" + Date.now(),
    lastname: "Test" + Date.now(),
    bio: "Test Test Bio" + Date.now(),
}

export const updateProfileData: ProfileUpdateSchema = {
    firstname: "Updated Name" + Date.now(),
    lastname: "Updated Lastname" + Date.now(),
    bio: "Updated Bio" + Date.now(),
}

export const invalidProfileData: ProfileUpdateSchema = {
    firstname: "",
    lastname: "",
    bio: "",
}

export const createUserData = (role: Role = Role.USER, isActive: boolean = true, random: string = ""): CreateUserSchema => {
    return {
        email: `test${role}${random}@test.com`,
        password: USER_PASSWORD,
        role: role,
        isActive: isActive,
    }
}

export const updateUserData = (role: Role = Role.USER, isActive: boolean = true): UpdateUserSchema => {
    return {
        email: `test${role}@test.com`,
        password: USER_PASSWORD,
        role: role,
        isActive: isActive,
    }
}

export const createPostData = (status: PostStatus, categories: number[]): PostCreateSchema => {
    return {
        title: `Test Post ${Date.now()}`,
        description: `Test Post Description ${Date.now()}`,
        status: status,
        categories: categories
    }
}

export const createCategoryData = (random: number = 1): CategorySchema => {
    return {
        name: `Test Category ${random}`,
    }
}

export const createCommentData = (status: CommentStatus = CommentStatus.ACTIVE) => {
    return {
        title: "Test Comment",
        status: status,
    }
}
