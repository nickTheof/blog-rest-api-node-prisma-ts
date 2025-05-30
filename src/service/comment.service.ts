import prisma from "../prisma/client";
import {Comment, CommentStatus, Prisma} from "@prisma/client";
import {
    CommentCreateSchema,
    CommentUpdateSchema,
    FilterCommentsPaginationQuery,
} from "../types/zod-schemas.types";
import {CommentWithAuthor, CommentWithAuthorAndPost, CommentWithPost} from "../controller/comment.controller";
import {
    generateAuthorWhere, generateFilterCommentStatusWhere,
    generatePaginationQuery,
    generatePostWhere
} from "../utils/helpers/prisma-predicates.helpers";

const getAll = (query: FilterCommentsPaginationQuery): Promise<CommentWithAuthorAndPost[]> => {
    const queryPaginationArgs: Prisma.CommentFindManyArgs = generatePaginationQuery(query);
    const filterStatusWhere: Prisma.CommentWhereInput = generateFilterCommentStatusWhere(query.status);
    return prisma.comment.findMany({
        where: filterStatusWhere,
        ...queryPaginationArgs,
        include: {
            author: true,
            post: true,
        },
    })
}

const countAll = (query: FilterCommentsPaginationQuery, userUuid?: string, postUuid?: string): Promise<number> => {
    const filterStatusWhere: Prisma.CommentWhereInput = generateFilterCommentStatusWhere(query.status);
    const authorWhere: Prisma.CommentWhereInput = generateAuthorWhere(userUuid);
    const postWhere: Prisma.CommentWhereInput = generatePostWhere(postUuid);
    return prisma.comment.count({
        where: {
            ...filterStatusWhere,
            ...authorWhere,
            ...postWhere,
        }
    })
}


const getAllByUserUuid = (userUuid: string, query: FilterCommentsPaginationQuery): Promise<CommentWithPost[]> => {
    const paginationArgs: Prisma.CommentFindManyArgs = generatePaginationQuery(query);
    const authorWhere: Prisma.CommentWhereInput = generateAuthorWhere(userUuid);
    const filterStatusWhere: Prisma.CommentWhereInput = generateFilterCommentStatusWhere(query.status);
    return prisma.comment.findMany({
        where: {
            ...authorWhere,
            ...filterStatusWhere
        },
        ...paginationArgs,
        include: {
            post: true,
        }
    })
}


const getAllByPostUuid = (postUuid: string, query: FilterCommentsPaginationQuery): Promise<CommentWithAuthor[]> => {
    const paginationArgs: Prisma.CommentFindManyArgs = generatePaginationQuery(query);
    const postWhere: Prisma.CommentWhereInput = generatePostWhere(postUuid);
    const filterStatusWhere: Prisma.CommentWhereInput = generateFilterCommentStatusWhere(query.status);
    return prisma.comment.findMany({
        where: {
            ...postWhere,
            ...filterStatusWhere
        },
        ...paginationArgs,
        include: {
            author: true,
        }
    })
}

const getById = (id: bigint, status: CommentStatus = CommentStatus.ACTIVE): Promise<Comment | null> => {
    return prisma.comment.findUnique({
        where: {
            id,
            status
        }
    })
}

const getByUuid = (uuid: string, status: CommentStatus = CommentStatus.ACTIVE): Promise<CommentWithAuthorAndPost | null> => {
    return prisma.comment.findUnique({
        where: {
            uuid,
            status
        },
        include: {
            author: true,
            post: true,
        }
    })
}

const create = (userUuid: string, postUuid: string, data: CommentCreateSchema): Promise<CommentWithAuthorAndPost> => {
    return prisma.comment.create({
        data: {
            title: data.title,
            author: {
                connect: {
                    uuid: userUuid
                },
            },
            post: {
                connect: {
                    uuid: postUuid
                }
            }
        },
        include: {
            author: true,
            post: true,
        }
    })
}

const updateByUuid = (uuid: string, data: CommentUpdateSchema): Promise<CommentWithAuthorAndPost> => {
    return prisma.comment.update({
        where: {
            uuid: uuid
        },
        data: data,
        include: {
            author: true,
            post: true,
        }
    })
}

const deleteById = (id: bigint): Promise<Comment> => {
    return prisma.comment.delete({
        where: {
            id: id
        }
    })
}

const deleteByUuid = (uuid: string): Promise<Comment> => {
    return prisma.comment.delete({
        where: {
            uuid: uuid
        }
    })
}

export default {
    getAll,
    countAll,
    getAllByUserUuid,
    getAllByPostUuid,
    getById,
    getByUuid,
    create,
    updateByUuid,
    deleteById,
    deleteByUuid
}