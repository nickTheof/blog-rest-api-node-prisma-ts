import {Request, Response, NextFunction} from "express";
import profileService from "../service/profile.service";
import catchAsync from "../utils/catchAsync";
import {User} from "@prisma/client";
import {PaginationQuery, ProfileCreateSchema} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";
import userService from "../service/user.service";
import {AuthResponse} from "../types/user-auth.types";
import {UserTokenPayload} from "../types/user-auth.types";
import {getAuthenticatedProfile, getAuthenticatedUser} from "../utils/helpers/auth-profile.helpers";
import {
    formatProfile,
    formatProfiles,
    sendPaginatedResponse, sendSuccessArrayResponse, sendSuccessResponse
} from "../utils/helpers/response.helpers";
import {FormattedArrayEntityData, FormattedEntityData, ProfileWithUser} from "../types/response.types";



const getAllProfiles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    const profiles: ProfileWithUser[] = await profileService.getAll(query);
    const formattedProfiles: FormattedArrayEntityData = formatProfiles(profiles);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, formattedProfiles)
    } else {
        const totalItems = await profileService.countAll();
        return sendPaginatedResponse(res, formattedProfiles, query, totalItems);
    }
})

const getProfileByUserUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const user: User | null = await userService.getByUuid(uuid);
    if (!user) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    const profile: ProfileWithUser | null = await profileService.getByUserId(user.id);
    if (!profile) {
        return next(new AppError('EntityNotFound', `Profile with userId ${user.id} not found!`));
    }
    const formattedProfile: FormattedEntityData = formatProfile(profile);
    return sendSuccessResponse(res, formattedProfile)
})

const getProfileById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const profile: ProfileWithUser | null = await profileService.getById(BigInt(id));
    if (!profile) {
        return next(new AppError('EntityNotFound', `Profile with id ${id} not found!`));
    }
    const formattedProfile: FormattedEntityData = formatProfile(profile);
    return sendSuccessResponse(res, formattedProfile)
})

const getAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const profile: ProfileWithUser = await getAuthenticatedProfile(res, next);
    const formattedProfile: FormattedEntityData = formatProfile(profile);
    return sendSuccessResponse(res, formattedProfile)
})

const deleteProfileById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const profile: ProfileWithUser | null = await profileService.getById(BigInt(id));
    if (!profile) {
        return next(new AppError('EntityNotFound', `Profile with id ${id} not found!`));
    }
    await profileService.deleteById(profile.id);
    return sendSuccessResponse(res, null, 204);
})

const createAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: ProfileCreateSchema = req.body;
    const authResponse = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const profile: ProfileWithUser = await profileService.create(user.uuid, data);
    const formattedProfile: FormattedEntityData = formatProfile(profile);
    return sendSuccessResponse(res, formattedProfile, 201)
})

//TODO Add userId in token payload and use it to delete profile by user id

const deleteAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user: User = await getAuthenticatedUser(res, next);
    await profileService.deleteById(user.id);
    return sendSuccessResponse(res, null, 204);
})


//TODO add userId in token payload and use it to update profile by user id
const updateAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user: User = await getAuthenticatedUser(res, next);
    const updatedProfile: ProfileWithUser = await profileService.update(user.id, req.body);
    const formattedProfile: FormattedEntityData = formatProfile(updatedProfile);
    return sendSuccessResponse(res, formattedProfile, 200);
})

const updateProfileById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const profile: ProfileWithUser | null = await profileService.getById(BigInt(id));
    if (!profile) {
        return next(new AppError('EntityNotFound', `Profile with id ${id} not found!`));
    }
    const updatedProfile: ProfileWithUser = await profileService.updateById(profile.id, req.body);
    const formattedProfile: FormattedEntityData = formatProfile(updatedProfile);
    return sendSuccessResponse(res, formattedProfile, 200);
})

export default {
    getAllProfiles,
    getProfileByUserUuid,
    getProfileById,
    getAuthenticatedUserProfile,
    createAuthenticatedUserProfile,
    deleteAuthenticatedUserProfile,
    deleteProfileById,
    updateAuthenticatedUserProfile,
    updateProfileById,
}