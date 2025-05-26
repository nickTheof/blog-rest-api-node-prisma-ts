import {Request, Response, NextFunction} from 'express';
import catchAsync from "../utils/catchAsync";
import userService from "../service/user.service";
import {CreateUserSchema, UpdateUserSchema, PaginationQuery} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";


const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAll();
    return res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map(user => ({
            ...user,
            id: user.id.toString(),
        }))
    })
})

const getAllUsersPaginated = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    const users = await userService.getAllPaginated(query);
    return res.status(200).json({
        status: 'success',
        totalItems: await userService.countAll(),
        totalPages: Math.ceil(users.length / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: users.map(user => ({
            ...user,
            id: user.id.toString(),
        }))
    })
})

const getUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const user = await userService.getByUuid(uuid);
    if (!user) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    return res.status(200).json({
        status: 'success',
        data: {
            ...user,
            id: user.id.toString(),
        }
    })
})

const insertUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: CreateUserSchema = req.body;
    const user = await userService.create(data);
    return res.status(201).json({
        status: 'success',
        data: {
            ...user,
            id: user.id.toString(),
        }
    })
})

const updateUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: UpdateUserSchema = req.body;
    const toUpdate = await userService.getByUuid(uuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    const updatedUser = await userService.updateByUuid(uuid, data);
    return res.status(200).json({
        status: 'success',
        data: {
            ...updatedUser,
            id: updatedUser.id.toString(),
        }
    })
})

const deleteUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const toDelete = await userService.getByUuid(uuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `User with Uuid ${uuid} not found!`));
    }
    await userService.deleteByUuid(uuid);
    return res.status(204).json({
        status: 'success',
        data: null
    })
})

export default {
    getAllUsers,
    getAllUsersPaginated,
    getUserByUuid,
    insertUser,
    updateUserByUuid,
    deleteUserByUuid,
}

