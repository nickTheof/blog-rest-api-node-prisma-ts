import {Request, Response, NextFunction} from 'express';
import {create, deleteByUuid, getAll, getByUuid, updateByUuid, getAllPaginated, countAll} from "../service/user.service";
import {CreateUserSchema, UpdateUserSchema} from "../schemas/user.schema";
import catchAsync from "../utils/catchAsync";
import {PaginationQuery} from "../schemas/pagination-query.schema";


export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await getAll();
    return res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map(user => ({
            ...user,
            id: user.id.toString(),
        }))
    })
})

export const getAllUsersPaginated = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {page, limit} = res.locals.validatedQuery as PaginationQuery;
    const users = await getAllPaginated(page, limit);
    return res.status(200).json({
        status: 'success',
        totalItems: await countAll(),
        totalPages: Math.ceil(users.length / limit),
        currentPage: page,
        limit: limit,
        data: users.map(user => ({
            ...user,
            id: user.id.toString(),
        }))
    })
})

export const getUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const user = await getByUuid(uuid);
    return res.status(200).json({
        status: 'success',
        data: {
            ...user,
            id: user.id.toString(),
        }
    })
})

export const insertUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: CreateUserSchema = req.body;
    const user = await create(data);
    return res.status(201).json({
        status: 'success',
        data: {
            ...user,
            id: user.id.toString(),
        }
    })
})

export const updateUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: UpdateUserSchema = req.body;
    await getByUuid(uuid);
    const updatedUser = await updateByUuid(uuid, data);
    return res.status(200).json({
        status: 'success',
        data: {
            ...updatedUser,
            id: updatedUser.id.toString(),
        }
    })
})

export const deleteUserByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    await getByUuid(uuid);
    await deleteByUuid(uuid);
    return res.status(204).json({
        status: 'success',
        data: null
    })
})


