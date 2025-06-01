import userService from "../../../service/user.service";
import authService from "../../../service/auth.service";
import {Category, Role} from "@prisma/client";
import {User} from "@prisma/client";
import profileService from "../../../service/profile.service";
import {createCategoryData, createProfileData, createUserData, USER_PASSWORD} from "./testmockdata";
import {CreateUserSchema} from "../../../types/zod-schemas.types";
import categoryService from "../../../service/category.service";
import { ProfileWithUser} from "../../../types/response.types";

type SuccessLoginResponse = {
    status: "success",
    data: string
}

export const insertUser = async (role: Role = Role.USER, isActive: boolean = true, random: string = "") : Promise<User> => {
    const userToRegister: CreateUserSchema = createUserData(role, isActive, random);
    return userService.create(userToRegister);
}

export const insertCategory = async (random: number):Promise<Category> => {
    return await categoryService.create(createCategoryData(random));
}

export const insertProfile = async (userUuid: string): Promise<ProfileWithUser> => {
    return await profileService.create(userUuid, createProfileData);
}

export const createToken = async (role: Role = Role.USER, random: string = "") : Promise<string> => {
    const loginResponse: SuccessLoginResponse= await authService.loginUser({
        email: `test${role}${random}@test.com`,
        password: USER_PASSWORD
    }) as SuccessLoginResponse;
    return loginResponse.data;
}
