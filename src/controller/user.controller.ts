import {Request, Response, NextFunction} from 'express';
import catchAsync from "../utils/catchAsync";
import userService from "../service/user.service";
import {
    CreateUserSchema,
    UpdateUserSchema,
    FilterUsersPaginationQuery
} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";
import {
    FormattedArrayEntityData, FormattedEntityData, formatUser,
    formatUsers, sendPaginatedResponse, sendSuccessArrayResponse, sendSuccessResponse,
} from "../utils/helpers/response.helpers";
import {User} from "@prisma/client";
import {AuthResponse} from "../types/user-auth.types";
import {UserTokenPayload} from "../types/user-auth.types";


const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as FilterUsersPaginationQuery;
    const users: User[] = await userService.getAll(query);
    const formattedUsers: FormattedArrayEntityData = formatUsers(users);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, formattedUsers)
    } else {
        const totalItems = await userService.countAll(query.isActive);
        return sendPaginatedResponse(res, formattedUsers, query, totalItems);
    }
})

const getUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const user: User | null = await userService.getByUuid(uuid);
    if (!user) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    const formattedUser: FormattedEntityData = formatUser(user);
    return sendSuccessResponse(res, formattedUser)
})

const getAuthenticatedUser = catchAsync( async(req: Request, res: Response, next: NextFunction) => {
    const authResponse = res as AuthResponse;
    const authenticatedUser: UserTokenPayload = authResponse.locals.user;
    const currentUser: User | null = await userService.getByUuid(authenticatedUser.uuid);
    if (!currentUser) {
        return next(new AppError('EntityNotFound', `User with Uuid ${authenticatedUser.uuid} not found!`));
    }
    const formattedUser: FormattedEntityData = formatUser(currentUser);
    return sendSuccessResponse(res, formattedUser)
})

const insertUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: CreateUserSchema = req.body;
    const user: User = await userService.create(data);
    const formattedUser: FormattedEntityData = formatUser(user);
    return sendSuccessResponse(res, formattedUser, 201);
})

const updateUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: UpdateUserSchema = req.body;
    const toUpdate: User | null = await userService.getByUuid(uuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    const updatedUser: User = await userService.updateByUuid(uuid, data);
    const formattedUser: FormattedEntityData = formatUser(updatedUser);
    return sendSuccessResponse(res, formattedUser);
})

const updateAuthenticatedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse = res as AuthResponse;
    const authenticatedUser: UserTokenPayload = authResponse.locals.user;
    const data: UpdateUserSchema = req.body;
    const updatedUser: User = await userService.updateByUuid(authenticatedUser.uuid, data);
    return sendSuccessResponse(res, formatUser(updatedUser));
})

const deleteUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const toDelete: User | null = await userService.getByUuid(uuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    await userService.deleteByUuid(uuid);
    return sendSuccessResponse(res, null, 204);
})

// Softly delete authenticated user
const deleteAuthenticatedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse = res as AuthResponse;
    const authenticatedUser: UserTokenPayload = authResponse.locals.user;
    await userService.deleteSoftByUuid(authenticatedUser.uuid)
    return sendSuccessResponse(res, null, 204);
})

export default {
    getAllUsers,
    getUserByUuid,
    getAuthenticatedUser,
    insertUser,
    updateUserByUuid,
    updateAuthenticatedUser,
    deleteUserByUuid,
    deleteAuthenticatedUser
}

