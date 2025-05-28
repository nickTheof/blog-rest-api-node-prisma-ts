import catchAsync from "../utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {CommentCreateSchema, PaginationQuery} from "../types/zod-schemas.types";
import {AuthResponse, UserTokenPayload} from "../types/user-auth.types";
import commentService from "../service/comment.service";
import userService from "../service/user.service";
import postService from "../service/post.service";
import {AppError} from "../utils/AppError";
import { Post, Prisma, User} from "@prisma/client";
import {
    formatComments,
    formatCommentsWithAuthor, formatCommentsWithPost, FormattedCommentWithAuthor, FormattedCommentWithPost,
    sendPaginatedResponse
} from "../utils/helpers/response.helpers";

export type CommentWithAuthorAndPost = Prisma.CommentGetPayload<{
    include: {
        author: true,
        post: true
    }
}>;

export type CommentWithAuthor = Prisma.CommentGetPayload<{
    include: {
        author: true,
    }
}>;

export type CommentWithPost = Prisma.CommentGetPayload<{
    include: {
        post: true,
    }
}>;

const getAllComments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: PaginationQuery = res.locals.validatedQuery as PaginationQuery;
    if (!query.paginated) {
        const data: CommentWithAuthorAndPost[] = await commentService.getAll();
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: formatComments(data)
        })
    } else {
        const [data, totalItems] = await Promise.all([
            commentService.getAllPaginated(query),
            commentService.countAll()
        ])
        const formattedData = formatComments(data);
        return sendPaginatedResponse(res, formattedData, query, totalItems);
    }
})

const getAllCommentsByPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: PaginationQuery = res.locals.validatedQuery as PaginationQuery;
    const postUuid: string = req.params.uuid;
    if (!query.paginated) {
        const data: CommentWithAuthor[] = await commentService.getAllByPostUuid(postUuid);
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: formatCommentsWithAuthor(data)
        })
    } else {
        const [data, totalItems] = await Promise.all([
            commentService.getAllByPostUuidPaginated(postUuid, query),
            commentService.countAllByPostUuid(postUuid)
        ])
        const formattedData: FormattedCommentWithAuthor[] = formatCommentsWithAuthor(data);
        return sendPaginatedResponse(res, formattedData, query, totalItems);
    }
})

const getAllCommentsByUserUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: PaginationQuery = res.locals.validatedQuery as PaginationQuery;
    const userUuid: string = req.params.uuid;
    if (!query.paginated) {
        const data: CommentWithPost[] = await commentService.getAllByUserUuid(userUuid);
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: formatCommentsWithPost(data)
        })
    } else {
        const [data, totalItems] = await Promise.all([
            commentService.getAllByUserUuidPaginated(userUuid, query),
            commentService.countAllByUserUuid(userUuid)
        ])
        const formattedData: FormattedCommentWithPost[] = formatCommentsWithPost(data);
        return sendPaginatedResponse(res, formattedData, query, totalItems);
    }
})

const createComment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const comment: CommentCreateSchema = req.body;
    const postUuid: string = req.params.uuid;
    const {user} = await getAuthenticatedUserAndPost(postUuid, res);
    const newComment: CommentWithAuthorAndPost = await commentService.create(user.uuid, postUuid, comment);

    return res.status(201).json({
        status: 'success',
        data: formatComments([newComment])[0]
    })
})

async function getAuthenticatedUserAndPost(postUuid: string, res: Response): Promise<{user: User, post: Post}> {
    const authRes = res as AuthResponse;
    const user: UserTokenPayload = authRes.locals.user;
    const fetchedUser: User | null = await userService.getByUuid(user.uuid);
    if (!fetchedUser) {
        throw new AppError('EntityNotFound', `User with uuid ${user.uuid} not found!`);
    }
    const post: Post | null = await postService.getByUuid(postUuid);
    if (!post) {
        throw new AppError("EntityNotFound", `Post with uuid ${postUuid} not found!`);
    }
    return { user: fetchedUser, post: post };
}

export default {
    getAllComments,
    getAllCommentsByPostUuid,
    getAllCommentsByUserUuid,
    createComment
}