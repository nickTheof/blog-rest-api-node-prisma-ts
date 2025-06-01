import {Request, Response, NextFunction} from "express";
import postService from "../service/post.service";
import catchAsync from "../utils/catchAsync";
import {AppError} from "../utils/AppError";
import {Post, User} from "@prisma/client";
import {AuthResponse} from "../types/user-auth.types";
import {UserTokenPayload} from "../types/user-auth.types";
import {
    PostCreateSchema,
    PostUpdateSchema,
    FilterPostsPaginationQuery
} from "../types/zod-schemas.types";
import {
    formatPost,
    formatPosts,
    sendPaginatedResponse, sendSuccessArrayResponse, sendSuccessResponse
} from "../utils/helpers/response.helpers";
import {FormattedArrayEntityData, FormattedEntityData} from "../types/response.types";
import userService from "../service/user.service";

const getAllPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as FilterPostsPaginationQuery;
    const posts: Post[] = await postService.getAll(query, undefined);
    const formattedPosts: FormattedArrayEntityData = formatPosts(posts);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, formattedPosts);
    } else {
        const totalItems: number = await postService.countAll(query.status, undefined);
        return sendPaginatedResponse(res, formattedPosts, query, totalItems);
    }
})

const getAllUserPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as FilterPostsPaginationQuery;
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const posts: Post[] = await postService.getAll(query, user.uuid);
    const formattedPosts: FormattedArrayEntityData = formatPosts(posts);
    if (!query.paginated) {
       return sendSuccessArrayResponse(res, formattedPosts);
    } else {
        const totalItems: number = await postService.countAll(query.status, user.uuid);
        return sendPaginatedResponse(res, formattedPosts, query, totalItems);
    }
})

const getAllUserPostsByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as FilterPostsPaginationQuery;
    const uuid: string = req.params.uuid;
    const user: User | null = await userService.getByUuid(uuid);
    if (!user) {
        return next(new AppError("EntityNotFound", `User with uuid ${uuid} not found`));
    }
    const posts: Post[] = await postService.getAll(query, uuid);
    const formattedPosts: FormattedArrayEntityData = formatPosts(posts);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, formattedPosts);
    } else {
        const totalItems: number = await postService.countAll(query.status, uuid);
        return sendPaginatedResponse(res, formattedPosts, query, totalItems);
    }
})

const getPostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: Post | null = await postService.getFirstByFilters(uuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Post with uuid ${uuid} not found`));
    }
    const formattedPost: FormattedEntityData = formatPost(data);
    return sendSuccessResponse(res, formattedPost);
})

const getAuthenticatedUserPostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const {uuid} = req.params;
    const data: Post | null = await postService.getFirstByFilters(uuid, user.uuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Post with uuid ${uuid} not found`));
    }
    const formattedPost: FormattedEntityData = formatPost(data);
    return sendSuccessResponse(res, formattedPost);
})

const getPostByUserUuidAndPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userUuid = req.params.uuid;
    const postUuid = req.params.postUuid;
    const data: Post | null = await postService.getFirstByFilters(userUuid, postUuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Post with uuid ${postUuid} not found`));
    }
    const formattedPost: FormattedEntityData = formatPost(data);
    return sendSuccessResponse(res, formattedPost);
})

const insertPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const data: PostCreateSchema = req.body;
    const post: Post = await postService.create(user.uuid, data);
    const formattedPost: FormattedEntityData = formatPost(post);
    return sendSuccessResponse(res, formattedPost, 201);
})

const updatePostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: PostUpdateSchema = req.body;
    const toUpdate: Post | null = await postService.getFirstByFilters(uuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${uuid} not found!`));
    }
    const updatedPost: Post = await postService.updateByUuid(uuid, data);
    const formattedPost: FormattedEntityData = formatPost(updatedPost);
    return sendSuccessResponse(res, formattedPost);
})

const updateAuthenticatedUserPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const data: PostUpdateSchema = req.body;
    const postUuid: string = req.params.uuid;
    const toUpdate: Post | null = await postService.getFirstByFilters(postUuid, user.uuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${postUuid} not found!`));
    }
    const updatedPost: Post = await postService.updateByUserUuidAndPostUuid(user.uuid, postUuid, data);
    const formattedPost: FormattedEntityData = formatPost(updatedPost);
    return sendSuccessResponse(res, formattedPost);
})

const updatePostByUserUuidAndPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userUuid: string = req.params.uuid;
    const postUuid: string = req.params.postUuid;
    const data: PostUpdateSchema = req.body;
    const toUpdate: Post | null = await postService.getFirstByFilters(userUuid, postUuid);
    if (!toUpdate) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${postUuid} not found!`));
    }
    const updatedPost: Post = await postService.updateByUserUuidAndPostUuid(userUuid, postUuid, data);
    const formattedPost: FormattedEntityData = formatPost(updatedPost);
    return sendSuccessResponse(res, formattedPost);
})

const deletePostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const toDelete: Post | null = await postService.getFirstByFilters(uuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${uuid} not found!`));
    }
    await postService.softDeleteByUuid(uuid);
    return sendSuccessResponse(res, null, 204);
})

const authUserDeletePostByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse  = res as AuthResponse;
    const user: UserTokenPayload = authResponse.locals.user;
    const {uuid} = req.params;
    const toDelete: Post | null = await postService.getFirstByFilters(uuid, user.uuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${uuid} not found!`));
    }
    await postService.softDeleteByUserUuidAndPostUuid(user.uuid, uuid);
    return sendSuccessResponse(res, null, 204);
})

const deletePostByUserUuidAndPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userUuid: string = req.params.uuid;
    const postUuid: string = req.params.postUuid;
    const toDelete: Post | null = await postService.getFirstByFilters(userUuid, postUuid);
    if (!toDelete) {
        return next(new AppError('EntityNotFound', `Post with Uuid ${postUuid} not found!`));
    }
    await postService.softDeleteByUserUuidAndPostUuid(userUuid, postUuid);
    return sendSuccessResponse(res, null, 204);
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