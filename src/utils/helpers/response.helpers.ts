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

export type FormattedPaginatedData = FormattedProfile[] | FormattedPost[] | FormattedUser[] | Category[] | FormattedCommentWithAuthorAndPost[] | FormattedCommentWithAuthor[] | FormattedCommentWithPost[];

export const formatPosts = (post: Post[]): FormattedPost[] => {
    return post.map(post => ({
        ...post,
        id: post.id.toString(),
        authorId: post.authorId.toString(),
    }))
}

export const formatUsers = (users: User[]): FormattedUser[] => {
    return users.map(user => {
        return {
            ...user,
            id: user.id.toString()
        }
    })
}


export const formatProfiles = (profiles: ProfileWithUser[]): FormattedProfile[] => {
    return profiles.map(profile => {
        return {
            ...profile,
            id: profile.id.toString(),
            userId: profile.userId.toString(),
            user: {
                ...profile.user,
                id: profile.user.id.toString()
            }
        }
    })
}

export const formatComments = (comments: CommentWithAuthorAndPost[]): FormattedCommentWithAuthorAndPost[] => {
    return comments.map(comment => {
        return {
            ...comment,
            userId: comment.userId.toString(),
            postId: comment.postId.toString(),
            id: comment.id.toString(),
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
    })
}

export const formatCommentsWithAuthor = (comments: CommentWithAuthor[]): FormattedCommentWithAuthor[] => {
    return comments.map(comment => {
        return {
            ...comment,
            userId: comment.userId.toString(),
            postId: comment.postId.toString(),
            id: comment.id.toString(),
            author: {
                ...comment.author,
                id: comment.author.id.toString(),
            }
        }
    })
}

export const formatCommentsWithPost = (comments: CommentWithPost[]): FormattedCommentWithPost[] => {
    return comments.map(comment => {
        return {
            ...comment,
            userId: comment.userId.toString(),
            postId: comment.postId.toString(),
            id: comment.id.toString(),
            post: {
                ...comment.post,
                id: comment.post.id.toString(),
                authorId: comment.post.authorId.toString(),
            }
        }
    })
}

export const sendPaginatedResponse = (res: Response, data: FormattedPaginatedData, query: PaginationQuery, totalItems: number) => {
    return res.status(200).json({
        status: 'success',
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: data
    })
}
