import {Request, Response, NextFunction} from 'express';
import catchAsync from "../utils/catchAsync";
import userService from "../service/user.service";
import {CreateUserSchema, UpdateUserSchema, PaginationQuery} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";
import {
    FormattedPaginatedData, formatUser,
    formatUsers, sendPaginatedResponse,
} from "../utils/helpers/response.helpers";
import {User} from "@prisma/client";
import {AuthResponse} from "../types/user-auth.types";
import {UserTokenPayload} from "../types/user-auth.types";


const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    if (!query.paginated) {
        const users: User[] = await userService.getAll();
        return res.status(200).json({
            status: 'success',
            results: users.length,
            data: formatUsers(users)
        })
    } else {
        const [users, totalItems] = await Promise.all([
            userService.getAllPaginated(query),
            userService.countAll()
        ]);
        const dataFormatted: FormattedPaginatedData = formatUsers(users);
        return sendPaginatedResponse(res, dataFormatted, query, totalItems);
    }
})

const getUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const user: User | null = await userService.getByUuid(uuid);
    if (!user) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    return res.status(200).json({
        status: 'success',
        data: formatUser(user)
    })
})

const getAuthenticatedUser = catchAsync( async(req: Request, res: Response, next: NextFunction) => {
    const authResponse = res as AuthResponse;
    const authenticatedUser: UserTokenPayload = authResponse.locals.user;
    const currentUser: User | null = await userService.getByUuid(authenticatedUser.uuid);
    if (!currentUser) {
        return next(new AppError('EntityNotFound', `User with Uuid ${authenticatedUser.uuid} not found!`));
    }
    return res.status(200).json({
        status: 'success',
        data: formatUser(currentUser)
    })
})

const insertUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: CreateUserSchema = req.body;
    const user: User = await userService.create(data);
    return res.status(201).json({
        status: 'success',
        data: formatUser(user)
    })
})

const updateUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: UpdateUserSchema = req.body;
    const toUpdate: User | null = await userService.getByUuid(uuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    const updatedUser: User = await userService.updateByUuid(uuid, data);
    return res.status(200).json({
        status: 'success',
        data: formatUser(updatedUser)
    })
})

const updateAuthenticatedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse = res as AuthResponse;
    const authenticatedUser: UserTokenPayload = authResponse.locals.user;
    const data: UpdateUserSchema = req.body;
    const updatedUser: User = await userService.updateByUuid(authenticatedUser.uuid, data);
    return res.status(200).json({
        status: 'success',
        data: formatUser(updatedUser)
    })
})

const deleteUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const toDelete: User | null = await userService.getByUuid(uuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    await userService.deleteByUuid(uuid);
    return res.status(204).json({
        status: 'success',
        data: null
    })
})

// Softly delete authenticated user
const deleteAuthenticatedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse = res as AuthResponse;
    const authenticatedUser: UserTokenPayload = authResponse.locals.user;
    await userService.deleteSoftByUuid(authenticatedUser.uuid)
    return res.status(204).json({
        status: 'success',
        data: null
    })
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

