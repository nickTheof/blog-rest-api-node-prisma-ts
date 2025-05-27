import prisma from '../prisma/client';
import {PaginationQuery, PostCreateSchema, PostUpdateSchema} from "../types/zod-schemas.types";
import { Post } from "@prisma/client";
import mapUpdatePostData from "../utils/helpers/update.helpers";


// Get all posts
const getAll = async (): Promise<Post[]> => {
    return prisma.post.findMany();
};

// Get count of all posts
const countAll = async (): Promise<number> => {
    return prisma.post.count();
};

// Get paginated posts
const getAllPaginated = async (query: PaginationQuery): Promise<Post[]> => {
    return prisma.post.findMany({
        skip: (query.page - 1) * query.limit,
        take: query.limit
    });
};

// Get all posts for a user (by user UUID)
const getAllByUserUuid = async (userUuid: string): Promise<Post[]> => {
    return prisma.post.findMany({
        where: {
            author: { uuid: userUuid }
        }
    });
};

// Get paginated posts for a user
const getAllPaginatedByUserUuid = async (
    userUuid: string,
    query: PaginationQuery
): Promise<Post[]> => {
    return prisma.post.findMany({
        where: {
            author: { uuid: userUuid }
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
    });
};

// Get count of all user posts
const countAllByUserUuid = async (userUuid: string): Promise<number> => {
    return prisma.post.count({
        where: {
            author: { uuid: userUuid }
        }
    });
};

// Get a single post by its UUID
const getByUuid = async (uuid: string): Promise<Post | null> => {
    return prisma.post.findUnique({
        where: { uuid }
    });
};

const getByAuthorUuidAndPostUuid = async (
    userUuid: string,
    postUuid: string
): Promise<Post | null> => {
    return prisma.post.findUnique({
        where: {
            author: { uuid: userUuid },
            uuid: postUuid
        }
    });
}

// Create a post and link to a user by UUID
const create = async (
    userUuid: string,
    data: PostCreateSchema
): Promise<Post> => {
    const { title, description, published, categories } = data;
    const categoriesConnectData = categories?.map(id => ({ id })) || [];

    return prisma.post.create({
        data: {
            title,
            description,
            published: published ?? false,
            author: {
                connect: { uuid: userUuid }
            },
            category: {
                connect: categoriesConnectData
            }
        }
    });
};

// Update a post by UUID
const updateByUuid = async (
    uuid: string,
    data: PostUpdateSchema): Promise<Post> => {
    const updateData = mapUpdatePostData(data);

    return prisma.post.update({
        where: {
            uuid: uuid,
        },
        data: updateData,
        include: {
            category: true, // Optional: include categories in result
        },
    });
};

// Update a post by user UUID and post uuid
const updateByUserUuidAndPostUuid = async (
    userUuid: string,
    postUuid: string,
    data: PostUpdateSchema
) => {
    const updateData = mapUpdatePostData(data);
    return prisma.post.update({
        where: {
            author: { uuid: userUuid },
            uuid: postUuid
        },
        data: updateData
    });
}

// Delete a post by UUID
const deleteByUuid = async (uuid: string): Promise<Post> => {
    return prisma.post.delete({
        where: { uuid }
    });
};

const deleteByUserUuidAndPostUuid = async (userUuid: string, postUuid: string): Promise<Post> => {
    return prisma.post.delete({
        where: {
            author: { uuid: userUuid },
            uuid: postUuid
        }
    });
}

export default {
    getAll,
    countAll,
    getAllPaginated,
    getAllUserPosts: getAllByUserUuid,
    getByAuthorUuidAndPostUuid,
    countAllUserPosts: countAllByUserUuid,
    getAllUserPostsPaginated: getAllPaginatedByUserUuid,
    getByUuid,
    create,
    updateByUuid,
    updateByUserUuidAndPostUuid,
    deleteByUuid,
    deleteByUserUuidAndPostUuid
};
