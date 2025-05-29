import {NextFunction, Response} from "express";
import {User} from "@prisma/client";
import {ProfileWithUser} from "./response.helpers";
import {AuthResponse, UserTokenPayload} from "../../types/user-auth.types";
import userService from "../../service/user.service";
import {AppError} from "../AppError";
import profileService from "../../service/profile.service";


export const getAuthenticatedProfile = async (res: Response, next: NextFunction):Promise<ProfileWithUser> => {
    const authResponse = res as AuthResponse;
    const userAuth: UserTokenPayload = authResponse.locals.user;
    const profile: ProfileWithUser | null = await profileService.getByUserUuid(userAuth.uuid);
    if (!profile) {
        throw new AppError("EntityNotFound", `Profile with user uuid ${userAuth.uuid} not found!`);
    }
    return profile;
}

export const getAuthenticatedUser = async (res: Response, next: NextFunction):Promise<User> => {
    const authResponse = res as AuthResponse;
    const userAuth: UserTokenPayload = authResponse.locals.user;
    const user: User | null = await userService.getByUuid(userAuth.uuid);
    if (!user) {
        throw new AppError("EntityNotFound", `User with Uuid ${userAuth.uuid} not found!`);
    }
    return user;
}