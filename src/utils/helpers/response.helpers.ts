import {Response} from "express";
import {Category, Post, Prisma, User} from "@prisma/client";
import {PaginationQuery} from "../../types/zod-schemas.types";

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

export type FormattedPaginatedData = FormattedProfile[] | FormattedPost[] | FormattedUser[] | Category[];

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
