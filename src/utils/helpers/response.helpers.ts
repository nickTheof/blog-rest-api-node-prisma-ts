import {Response} from "express";
import {Category, Post, Prisma, User} from "@prisma/client";
import {PaginationQuery} from "../../types/zod-schemas.types";
import {CommentWithAuthor, CommentWithAuthorAndPost, CommentWithPost} from "../../controller/comment.controller";

export type ProfileWithUser = Prisma.ProfileGetPayload<{
    include: {
        user: true;
    };
}>;

export type FormattedPost = Omit<Post, 'id' | 'authorId'> & {
    id: string;
    authorId: string;
}

export type FormattedUser = Omit<User, 'id'> & {
    id: string;
}

export type FormattedProfile = Omit<ProfileWithUser, 'id' | 'userId' | 'user'> & {
    id: string;
    userId: string;
    user: FormattedUser;
}

export type FormattedCommentWithAuthorAndPost = Omit<CommentWithAuthorAndPost, 'id' | 'userId' | 'postId' | 'author' | 'post'> & {
    id: string;
    userId: string;
    postId: string;
    author: FormattedUser;
    post: FormattedPost;
}

export type FormattedCommentWithAuthor = Omit<CommentWithAuthor, 'id' | 'userId' | 'postId' | 'author' > & {
    id: string;
    userId: string;
    postId: string;
    author: FormattedUser;
}

export type FormattedCommentWithPost = Omit<CommentWithPost, 'id' | 'userId' | 'postId' | 'post' > & {
    id: string;
    userId: string;
    postId: string;
    post: FormattedPost;
}

export type FormattedEntityData = FormattedPost | FormattedUser | FormattedProfile | Category | FormattedCommentWithAuthorAndPost | FormattedCommentWithAuthor | FormattedCommentWithPost;
export type FormattedArrayEntityData = FormattedEntityData[];

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

