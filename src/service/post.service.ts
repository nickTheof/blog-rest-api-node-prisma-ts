import prisma from '../prisma/client';
import {
    FilterPostsPaginationQuery,
    PostCreateSchema,
    PostUpdateSchema
} from "../types/zod-schemas.types";
import {Post, PostStatus, Prisma} from "@prisma/client";
import mapUpdatePostData, {MappedUpdateData} from "../utils/helpers/update.helpers";
import {
    generateFilterAuthorWhere, generateFilterPostUuidWhere,
    generateFilterStatusWhere,
    generatePaginationQuery
} from "../utils/helpers/prisma-predicates.helpers";

const getAll = async (query: FilterPostsPaginationQuery, authorUuid?: string): Promise<Post[]> => {
    const statusWhere: Prisma.PostWhereInput = generateFilterStatusWhere(query.status);
    const authorWhere: Prisma.PostWhereInput = generateFilterAuthorWhere(authorUuid);
    const paginationArgs: Prisma.PostFindManyArgs = generatePaginationQuery(query);
    return prisma.post.findMany({
        where: {
            ...statusWhere,
            ...authorWhere,
        },
        ...paginationArgs
    });
};

const countAll = async (status?: PostStatus[] , authorUuid?: string ): Promise<number> => {
    const statusWhere: Prisma.PostWhereInput = generateFilterStatusWhere(status);
    const authorWhere: Prisma.PostWhereInput = generateFilterAuthorWhere(authorUuid);
    return prisma.post.count({
        where: {
            ...statusWhere,
            ...authorWhere,
        }
    });
};

const getFirstByFilters = async ( postUuid?: string, authorUuid?: string ): Promise<Post | null> => {
    const authorWhere: Prisma.PostWhereInput = generateFilterAuthorWhere(authorUuid);
    const postUuidWhere: Prisma.PostWhereInput = generateFilterPostUuidWhere(postUuid);
    return prisma.post.findFirst({
        where: {
            ...authorWhere,
            ...postUuidWhere
        }
    })

}

const create = async (
    userUuid: string,
    data: PostCreateSchema
): Promise<Post> => {
    const { title, description, status, categories } = data;
    const categoriesConnectData = categories?.map(id => ({ id })) || [];

    return prisma.post.create({
        data: {
            title,
            description,
            status: status ?? PostStatus.DRAFT,
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
    const updateData: MappedUpdateData = mapUpdatePostData(data);

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

const softDeleteByUuid = async (uuid: string): Promise<Post> => {
    return prisma.post.update({
        where: { uuid },
        data: {
            status: PostStatus.ARCHIVED
        }
    });
};

const softDeleteByUserUuidAndPostUuid = async (userUuid: string, postUuid: string): Promise<Post> => {
    return prisma.post.update({
        where: {
            author: { uuid: userUuid },
            uuid: postUuid
        },
        data: {
            status: PostStatus.ARCHIVED
        }
    })
}


export default {
    getAll,
    countAll,
    getFirstByFilters,
    create,
    updateByUuid,
    updateByUserUuidAndPostUuid,
    deleteByUuid,
    deleteByUserUuidAndPostUuid,
    softDeleteByUserUuidAndPostUuid,
    softDeleteByUuid,
}