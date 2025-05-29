import catchAsync from "../utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {CommentCreateSchema, CommentUpdateSchema, PaginationQuery} from "../types/zod-schemas.types";
import {AuthResponse, UserTokenPayload} from "../types/user-auth.types";
import commentService from "../service/comment.service";
import userService from "../service/user.service";
import postService from "../service/post.service";
import {AppError} from "../utils/AppError";
import { Post, Prisma, User} from "@prisma/client";
import {
    formatComment,
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

const getCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: CommentWithAuthorAndPost | null = await commentService.getByUuid(uuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${uuid} not found`));
    }
    return res.status(200).json({
        status: 'success',
        data: formatComment(data)
    })
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
        data: formatComment(newComment)
    })
})

const updateCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: CommentUpdateSchema = req.body;
    const comment: CommentWithAuthorAndPost | null = await commentService.getByUuid(uuid);
    if (!comment) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${uuid} not found`));
    }
    const updatedComment: CommentWithAuthorAndPost = await commentService.updateByUuid(uuid, data);
    return res.status(200).json({
        status: 'success',
        data: formatComment(updatedComment)
    })
})

const updateAuthenticatedUserCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authRes = res as AuthResponse;
    const user: UserTokenPayload = authRes.locals.user;
    const {commentUuid} = req.params;
    const data: CommentUpdateSchema = req.body;
    const comment: CommentWithAuthorAndPost | null = await commentService.getByUuid(commentUuid);
    if (!comment) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${commentUuid} not found`));
    }
    if (comment.author.uuid !== user.uuid) {
        return next(new AppError("EntityForbiddenAction", `Comment with uuid ${commentUuid} not found`));
    }
    const updatedComment: CommentWithAuthorAndPost = await commentService.updateByUuid(commentUuid, data);
    return res.status(200).json({
        status: 'success',
        data: formatComment(updatedComment)
    })
})

const deleteCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const comment: CommentWithAuthorAndPost | null = await commentService.getByUuid(uuid);
    if (!comment) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${uuid} not found`));
    }
    await commentService.deleteByUuid(uuid);
    return res.status(204).json({
        status: 'success',
        data: null
    })
})

const deleteAuthenticatedUserCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authRes = res as AuthResponse;
    const user: UserTokenPayload = authRes.locals.user;
    const {commentUuid} = req.params;
    const comment: CommentWithAuthorAndPost | null = await commentService.getByUuid(commentUuid);
    if (!comment) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${commentUuid} not found`));
    }
    if (comment.author.uuid !== user.uuid) {
        return next(new AppError("EntityForbiddenAction", `Comment with uuid ${commentUuid} not found`));
    }
    await commentService.deleteByUuid(commentUuid);
    return res.status(204).json({
        status: 'success',
        data: null
    })
})

async function getAuthenticatedUserAndPost(postUuid: string, res: Response): Promise<{user: User, post: Post}> {
    const authRes = res as AuthResponse;
    const user: UserTokenPayload = authRes.locals.user;
    const fetchedUser: User | null = await userService.getByUuid(user.uuid);
    if (!fetchedUser) {
        throw new AppError('EntityNotFound', `User with uuid ${user.uuid} not found!`);
    }
    const post: Post | null = await postService.getFirstByFilters(postUuid);
    if (!post) {
        throw new AppError("EntityNotFound", `Post with uuid ${postUuid} not found!`);
    }
    return { user: fetchedUser, post: post };
}

export default {
    getAllComments,
    getAllCommentsByPostUuid,
    getAllCommentsByUserUuid,
    getCommentByUuid,
    createComment,
    deleteCommentByUuid,
    deleteAuthenticatedUserCommentByUuid,
    updateCommentByUuid,
    updateAuthenticatedUserCommentByUuid
}