import postService from "../service/post.service";
import catchAsync from "../utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {PostCreateSchema, PostUpdateSchema, PaginationQuery} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";
import {Post} from "@prisma/client";
import {AuthResponse} from "../middlewares/auth.middleware";
import {UserTokenPayload} from "../types/user-auth.types";
import {formatPosts, sendPaginatedPostsResponse} from "../utils/helpers/response.helpers";

const getAllPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    if (!query.paginated) {
        const posts: Post[] = await postService.getAll();
        return res.status(200).json({
            status: 'success',
            results: posts.length,
            data: formatPosts(posts)
        })
    } else {
        const data: Post[] = await postService.getAllPaginated(query);
        const totalItems: number = await postService.countAll();
        return sendPaginatedPostsResponse(res, data, query, totalItems);
    }
})


const getAllUserPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    if (!query.paginated) {
        const data: Post[] = await postService.getAllUserPosts(user.uuid);
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: formatPosts(data)
        })
    } else {
        const data: Post[] = await postService.getAllUserPostsPaginated(user.uuid, query);
        const totalItems: number = await postService.countAllUserPosts(user.uuid);
        return sendPaginatedPostsResponse(res, data, query, totalItems);
    }

})

const getAllUserPostsByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    const uuid: string = req.params.uuid;
    if (!query.paginated) {
        const data: Post[] = await postService.getAllUserPosts(uuid);
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: formatPosts(data)
        })
    } else {
        const data: Post[] = await postService.getAllUserPostsPaginated(uuid, query);
        const totalItems: number = await postService.countAllUserPosts(uuid);
        return sendPaginatedPostsResponse(res, data, query, totalItems);
    }
})

const getPostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: Post | null = await postService.getByUuid(uuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Post with uuid ${uuid} not found`));
    }
    return res.status(200).json({
        status: 'success',
        data: formatPosts([data])[0]
    })
})

const getAuthenticatedUserPostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const {uuid} = req.params;
    const data: Post | null = await postService.getByAuthorUuidAndPostUuid(user.uuid, uuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Post with uuid ${uuid} not found`));
    }
    return res.status(200).json({
        status: 'success',
        data: formatPosts([data])[0]
    })
})

const getPostByUserUuidAndPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userUuid = req.params.uuid;
    const postUuid = req.params.postUuid;
    const data: Post | null = await postService.getByAuthorUuidAndPostUuid(userUuid, postUuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Post with uuid ${postUuid} not found`));
    }
    return res.status(200).json({
        status: 'success',
        data: formatPosts([data])[0]
    })
})

const insertPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const data: PostCreateSchema = req.body;
    const post: Post = await postService.create(user.uuid, data);
    return res.status(201).json({
        status: 'success',
        data: formatPosts([post])[0]
    })
})

const updatePostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: PostUpdateSchema = req.body;
    const toUpdate: Post | null = await postService.getByUuid(uuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${uuid} not found!`));
    }
    const updatedPost: Post = await postService.updateByUuid(uuid, data);
    return res.status(200).json({
        status: "success",
        data: formatPosts([updatedPost])[0]
    })
})

const updateAuthenticatedUserPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const data: PostUpdateSchema = req.body;
    const postUuid: string = req.params.uuid;
    const toUpdate: Post | null = await postService.getByAuthorUuidAndPostUuid(user.uuid, postUuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${postUuid} not found!`));
    }
    const updatedPost: Post = await postService.updateByUserUuidAndPostUuid(user.uuid, postUuid, data);
    return res.status(200).json({
        status: "success",
        data: formatPosts([updatedPost])[0]
    })
})

const updatePostByUserUuidAndPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userUuid: string = req.params.uuid;
    const postUuid: string = req.params.postUuid;
    const data: PostUpdateSchema = req.body;
    const toUpdate: Post | null = await postService.getByAuthorUuidAndPostUuid(userUuid, postUuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${postUuid} not found!`));
    }
    const updatedPost: Post = await postService.updateByUserUuidAndPostUuid(userUuid, postUuid, data);
    return res.status(200).json({
        status: "success",
        data: formatPosts([updatedPost])[0]
    })
})

const deletePostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const toDelete: Post | null = await postService.getByUuid(uuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${uuid} not found!`));
    }
    await postService.deleteByUuid(uuid);
    return res.status(204).json({
        status: "success",
        data: null
    })
})

const authUserDeletePostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const {uuid} = req.params;
    const toDelete: Post | null = await postService.getByAuthorUuidAndPostUuid(user.uuid, uuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${uuid} not found!`));
    }
    await postService.deleteByUserUuidAndPostUuid(user.uuid, uuid);
    return res.status(204).json({
        status: "success",
        data: null
    })
})

const deletePostByUserUuidAndPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userUuid: string = req.params.uuid;
    const postUuid: string = req.params.postUuid;
    const toDelete: Post | null = await postService.getByAuthorUuidAndPostUuid(userUuid, postUuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${postUuid} not found!`));
    }
    await postService.deleteByUserUuidAndPostUuid(userUuid, postUuid);
    return res.status(204).json({
        status: "success",
        data: null
    })
})

export default {
    getAllPosts,
    getAllUserPosts,
    getAllUserPostsByUuid,
    getAuthenticatedUserPostByUuid,
    getPostByUuid,
    getPostByUserUuidAndPostUuid,
    insertPost,
    updatePostByUuid,
    updateAuthenticatedUserPost,
    updatePostByUserUuidAndPostUuid,
    deletePostByUuid,
    authUserDeletePostByUuid,
    deletePostByUserUuidAndPostUuid
}