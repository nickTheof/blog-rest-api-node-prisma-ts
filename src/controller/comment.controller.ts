import catchAsync from "../utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {
    CommentCreateSchema,
    CommentUpdateSchema,
    FilterCommentsPaginationQuery,
} from "../types/zod-schemas.types";
import {AuthResponse, UserTokenPayload} from "../types/user-auth.types";
import commentService from "../service/comment.service";
import {AppError} from "../utils/AppError";
import {CommentStatus} from "@prisma/client";
import {
    formatComment,
    formatComments,
    formatCommentsWithAuthor,
    formatCommentsWithPost,
    sendPaginatedResponse, sendSuccessArrayResponse, sendSuccessResponse
} from "../utils/helpers/response.helpers";
import {
    CommentWithAuthor,
    CommentWithAuthorAndPost, CommentWithPost,
    FormattedCommentWithAuthor,
    FormattedCommentWithAuthorAndPost,
    FormattedCommentWithPost
} from "../types/response.types";


const getAllComments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: FilterCommentsPaginationQuery = res.locals.validatedQuery as FilterCommentsPaginationQuery;
    const comments: CommentWithAuthorAndPost[] = await commentService.getAll(query);
    const formattedComments: FormattedCommentWithAuthorAndPost[] = formatComments(comments);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, formattedComments);
    } else {
        const totalItems: number = await commentService.countAll(query);
        return sendPaginatedResponse(res, formattedComments, query, totalItems);
    }
})

const getCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: CommentWithAuthorAndPost | null = await commentService.getByUuid(uuid);
    if (!data) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${uuid} not found`));
    }
    const formattedComment: FormattedCommentWithAuthorAndPost = formatComment(data);
    return sendSuccessResponse(res, formattedComment);
})

const getAllCommentsByPostUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: FilterCommentsPaginationQuery = res.locals.validatedQuery as FilterCommentsPaginationQuery;
    const postUuid: string = req.params.uuid;
    const comments: CommentWithAuthor[] = await commentService.getAllByPostUuid(postUuid, query);
    const formattedComments: FormattedCommentWithAuthor[] = formatCommentsWithAuthor(comments);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, formattedComments);
    } else {
        const totalItems: number = await commentService.countAll(query, undefined, postUuid);
        return sendPaginatedResponse(res, formattedComments, query, totalItems);
    }
})

const getAllCommentsByUserUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: FilterCommentsPaginationQuery = res.locals.validatedQuery as FilterCommentsPaginationQuery;
    const userUuid: string = req.params.uuid;
    const comments: CommentWithPost[] = await commentService.getAllByUserUuid(userUuid, query);
    const formattedComments: FormattedCommentWithPost[] = formatCommentsWithPost(comments);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, formattedComments);
    } else {
        const totalItems: number = await commentService.countAll(query, userUuid);
        return sendPaginatedResponse(res, formattedComments, query, totalItems);
    }
})

const createComment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const comment: CommentCreateSchema = req.body;
    const postUuid: string = req.params.uuid;
    const user: UserTokenPayload = res.locals.user;
    const newComment: CommentWithAuthorAndPost = await commentService.create(user.uuid, postUuid, comment);
    const formattedComment: FormattedCommentWithAuthorAndPost = formatComment(newComment);
    return sendSuccessResponse(res, formattedComment, 201);
})

const updateCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const data: CommentUpdateSchema = req.body;
    const comment: CommentWithAuthorAndPost | null = await commentService.getByUuid(uuid);
    if (!comment) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${uuid} not found`));
    }
    const updatedComment: CommentWithAuthorAndPost = await commentService.updateByUuid(uuid, data);
    const formattedComment: FormattedCommentWithAuthorAndPost = formatComment(updatedComment);
    return sendSuccessResponse(res, formattedComment)
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
    const formattedComment: FormattedCommentWithAuthorAndPost = formatComment(updatedComment);
    return sendSuccessResponse(res, formattedComment)
})

const deleteCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const comment: CommentWithAuthorAndPost | null = await commentService.getByUuid(uuid);
    if (!comment) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${uuid} not found`));
    }
    await commentService.deleteByUuid(uuid);
    return sendSuccessResponse(res, null, 204);
})

const softlyDeleteCommentByUuid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uuid} = req.params;
    const comment: CommentWithAuthorAndPost | null = await commentService.getByUuid(uuid);
    if (!comment) {
        return next(new AppError("EntityNotFound", `Comment with uuid ${uuid} not found`));
    }
    await commentService.updateByUuid(uuid, {status: CommentStatus.INACTIVE});
})

// Softly deleted, change the status of the comment to delete
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
    await commentService.updateByUuid(commentUuid, {status: CommentStatus.DELETED});
    return sendSuccessResponse(res, null, 204);
})

export default {
    getAllComments,
    getAllCommentsByPostUuid,
    getAllCommentsByUserUuid,
    getCommentByUuid,
    createComment,
    deleteCommentByUuid,
    softlyDeleteCommentByUuid,
    deleteAuthenticatedUserCommentByUuid,
    updateCommentByUuid,
    updateAuthenticatedUserCommentByUuid
}