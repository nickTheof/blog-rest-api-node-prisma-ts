import {NextFunction, Response} from "express";
import {UserTokenPayload} from "../../types/user-auth.types";
import {AppError} from "../AppError";
import profileService from "../../service/profile.service";
import {ProfileWithUser} from "../../types/response.types";


export const getAuthenticatedProfile = async (res: Response, next: NextFunction):Promise<ProfileWithUser> => {
    const userAuth: UserTokenPayload = res.locals.user;
    const profile: ProfileWithUser | null = await profileService.getByUserUuid(userAuth.uuid);
    if (!profile) {
        throw new AppError("EntityNotFound", `Profile with user uuid ${userAuth.uuid} not found!`);
    }
    return profile;
}
