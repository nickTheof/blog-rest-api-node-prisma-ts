import {Response} from "express";
import { Post, User} from "@prisma/client";
import {PaginationQuery} from "../../types/zod-schemas.types";
import {
    CommentWithAuthor,
    CommentWithAuthorAndPost, CommentWithPost,
    FormattedArrayEntityData,
    FormattedCommentWithAuthor,
    FormattedCommentWithAuthorAndPost, FormattedCommentWithPost, FormattedEntityData,
    FormattedPost,
    FormattedProfile,
    FormattedUser,
    ProfileWithUser
} from "../../types/response.types";


export const formatPost= (post: Post): FormattedPost => {
    return {
        ...post,
        id: post.id.toString(),
        authorId: post.authorId.toString(),
    }
}

export const formatUser = (user: User): FormattedUser => {
    return {
        ...user,
        id: user.id.toString()
    }
}

export const formatProfile = (profile: ProfileWithUser): FormattedProfile => {
    return {
        ...profile,
        id: profile.id.toString(),
        userId: profile.userId.toString(),
        user: {
            ...profile.user,
            id: profile.user.id.toString()
        }
    }
}

export const formatComment = (comment: CommentWithAuthorAndPost): FormattedCommentWithAuthorAndPost => {
    return {
        ...comment,
        id: comment.id.toString(),
        userId: comment.userId.toString(),
        postId: comment.postId.toString(),
        author: {
            ...comment.author,
            id: comment.author.id.toString(),
        },
        post: {
            ...comment.post,
            id: comment.post.id.toString(),
            authorId: comment.post.authorId.toString(),
        }
    }
}

export const formatCommentWithAuthor = (comment: CommentWithAuthor): FormattedCommentWithAuthor => {
    return {
        ...comment,
        id: comment.id.toString(),
        userId: comment.userId.toString(),
        postId: comment.postId.toString(),
        author: {
            ...comment.author,
            id: comment.author.id.toString(),
        }
    }
}

export const formatCommentWithPost = (comment: CommentWithPost): FormattedCommentWithPost => {
    return {
        ...comment,
        id: comment.id.toString(),
        userId: comment.userId.toString(),
        postId: comment.postId.toString(),
        post: {
            ...comment.post,
            id: comment.post.id.toString(),
            authorId: comment.post.authorId.toString(),
        }
    }
}

export const formatUsers = (users: User[]): FormattedUser[] => {
    return users.map(user => formatUser(user));
}

export const formatPosts = (post: Post[]): FormattedPost[] => {
    return post.map(post => formatPost(post));
}

export const formatProfiles = (profiles: ProfileWithUser[]): FormattedProfile[] => {
    return profiles.map(profile => formatProfile(profile));
}

export const formatComments = (comments: CommentWithAuthorAndPost[]): FormattedCommentWithAuthorAndPost[] => {
    return comments.map(comment => formatComment(comment));
}

export const formatCommentsWithAuthor = (comments: CommentWithAuthor[]): FormattedCommentWithAuthor[] => {
    return comments.map(comment => formatCommentWithAuthor(comment));
}

export const formatCommentsWithPost = (comments: CommentWithPost[]): FormattedCommentWithPost[] => {
    return comments.map(comment => formatCommentWithPost(comment));
}

export const sendPaginatedResponse = (res: Response, data: FormattedArrayEntityData, query: PaginationQuery, totalItems: number) => {
    return res.status(200).json({
        status: 'success',
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: data
    })
}

export const sendSuccessArrayResponse = (res: Response, data: FormattedArrayEntityData) => {
    return res.status(200).json({
        status: 'success',
        results: data.length,
        data: data
    })
}

export const sendSuccessResponse = (res: Response, data: FormattedEntityData | null, status: number=200) => {
    return res.status(status).json({
        status: 'success',
        data: data
    })
}

export interface ApiResponse<T> {
    status: string;
    data: T;
    [key: string]: any;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T>{
    status: string;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    data: T;
}

export interface ApiErrorResponse extends ApiResponse<null>{
    message: string;
    errors: string[];
    [key: string]: any;
}

