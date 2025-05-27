import {Category, Post, Prisma, Profile, User} from "@prisma/client";
import {Response} from "express";
import {PaginationQuery} from "../../types/zod-schemas.types";

export type ProfileWithUser = Prisma.ProfileGetPayload<{
    include: {
        user: true;
    };
}>;

export const formatPosts = (post: Post[]) => {
    return post.map(post => ({
        ...post,
        id: post.id.toString(),
        authorId: post.authorId.toString(),
    }))
}

export const sendPaginatedPostsResponse = (res: Response, data: Post[], query: PaginationQuery, totalItems: number) => {
    return res.status(200).json({
        status: 'success',
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: formatPosts(data)
    })
}

export const formatUsers = (users: User[]) => {
    return users.map(user => {
        return {
            ...user,
            id: user.id.toString()
        }
    })
}

export const sendPaginatedUsersResponse = (res: Response, data: User[], query: PaginationQuery, totalItems: number) => {
    return res.status(200).json({
        status: 'success',
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: formatUsers(data)
    })
}

export const sendPaginatedCategoriesResponse = (res: Response, data: Category[], query: PaginationQuery, totalItems: number) => {
    return res.status(200).json({
        status: 'success',
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: data
    })
}

export const formatProfiles = (profiles: ProfileWithUser[]) => {
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

export const sendPaginatedProfilesResponse = (res: Response, data: ProfileWithUser[], query: PaginationQuery, totalItems: number) => {
    return res.status(200).json({
        status: 'success',
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: formatProfiles(data)
    })
}
