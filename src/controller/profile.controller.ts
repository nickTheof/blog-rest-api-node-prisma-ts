import profileService from "../service/profile.service";
import catchAsync from "../utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {User} from "@prisma/client";
import {PaginationQuery, ProfileCreateSchema} from "../types/zod-schemas.types";
import {
    formatProfile,
    formatProfiles,
    FormattedArrayEntityData,
    ProfileWithUser,
    sendPaginatedResponse
} from "../utils/helpers/response.helpers";
import {AppError} from "../utils/AppError";
import userService from "../service/user.service";
import {AuthResponse} from "../types/user-auth.types";
import {UserTokenPayload} from "../types/user-auth.types";

const getAllProfiles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    if (!query.paginated) {
        const profiles: ProfileWithUser[] = await profileService.getAll();
        return res.status(200).json({
            status: 'success',
            results: profiles.length,
            data: formatProfiles(profiles)
        })
    } else {
        const [profiles, totalItems] = await Promise.all([
            profileService.getAllPaginated(query),
            profileService.countAll()
        ])
        const dataFormatted: FormattedArrayEntityData = formatProfiles(profiles);
        return sendPaginatedResponse(res, dataFormatted, query, totalItems);
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
    return res.status(200).json({
        status: 'success',
        data: formatProfile(profile)
    })
})

const getProfileById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const profile: ProfileWithUser | null = await profileService.getById(BigInt(id));
    if (!profile) {
        return next(new AppError('EntityNotFound', `Profile with id ${id} not found!`));
    }
    return res.status(200).json({
        status: 'success',
        data: formatProfile(profile)
    })
})

const getAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {profile} = await getAuthenticatedUserAndProfile(res, next);
    return res.status(200).json({
        status: 'success',
        data: formatProfile(profile)
    })
})

const deleteProfileById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const profile: ProfileWithUser | null = await profileService.getById(BigInt(id));
    if (!profile) {
        return next(new AppError('EntityNotFound', `Profile with id ${id} not found!`));
    }
    await profileService.deleteById(profile.id);
    return res.status(204).json({
        status: 'success',
        data: null
    })
})

const createAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: ProfileCreateSchema = req.body;
    const authResponse = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const profile: ProfileWithUser = await profileService.create(user.uuid, data);
    return res.status(201).json({
        status: 'success',
        data: formatProfile(profile)
    })
})

const deleteAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {user} = await getAuthenticatedUserAndProfile(res, next);
    await profileService.deleteById(user.id);
    return res.status(204).json({
        status: 'success',
        data: null
    })
})

const updateAuthenticatedUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {user} = await getAuthenticatedUserAndProfile(res, next);
    const updatedProfile: ProfileWithUser = await profileService.update(user.id, req.body);
    return res.status(200).json({
        status: 'success',
        data: formatProfile(updatedProfile)
    })
})

const updateProfileById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const profile: ProfileWithUser | null = await profileService.getById(BigInt(id));
    if (!profile) {
        return next(new AppError('EntityNotFound', `Profile with id ${id} not found!`));
    }
    const updatedProfile: ProfileWithUser = await profileService.updateById(profile.id, req.body);
    return res.status(200).json({
        status: 'success',
        data: formatProfile(updatedProfile)
    })
})

async function getAuthenticatedUserAndProfile(
    res: Response,
    next: NextFunction
): Promise<{ user: User; profile: ProfileWithUser }> {
    const authResponse = res as AuthResponse;
    const userAuth: UserTokenPayload = authResponse.locals.user;

    const user = await userService.getByUuid(userAuth.uuid);
    if (!user) {
        throw new AppError("EntityNotFound", `User with Uuid ${userAuth.uuid} not found!`);
    }

    const profile = await profileService.getByUserId(user.id);
    if (!profile) {
        throw new AppError("EntityNotFound", `Profile with userId ${user.id} not found!`);
    }

    return { user, profile };
}

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