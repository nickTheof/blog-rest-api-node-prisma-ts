import prisma from "../prisma/client";
import {Comment} from "@prisma/client";
import {CommentCreateSchema, CommentUpdateSchema, PaginationQuery} from "../types/zod-schemas.types";
import {CommentWithAuthor, CommentWithAuthorAndPost, CommentWithPost} from "../controller/comment.controller";

const getAll = (): Promise<CommentWithAuthorAndPost[]> => {
    return prisma.comment.findMany({
        include: {
            author: true,
            post: true,
        }
    });
}

const countAll = (): Promise<number> => {
    return prisma.comment.count()
}

const getAllPaginated = (query: PaginationQuery): Promise<CommentWithAuthorAndPost[]> => {
    return prisma.comment.findMany({
        include: {
            author: true,
            post: true,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
    })
}

const getAllByUserUuid = (userUuid: string): Promise<CommentWithPost[]> => {
    return prisma.comment.findMany({
        where: {
            author: {
                uuid: userUuid,
            }
        },
        include: {
            post: true,
        }
    })
}

const countAllByUserUuid = (userUuid: string): Promise<number> => {
    return prisma.comment.count({
        where: {
            author: {
                uuid: userUuid,
            }
        }
    })
}

const getAllByUserUuidPaginated = (userUuid: string, query: PaginationQuery): Promise<CommentWithPost[]> => {
    return prisma.comment.findMany({
        where: {
            author: {
                uuid: userUuid,
            }
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
            post: true,
        }
    })
}

const getAllByPostUuid = (postUuid: string): Promise<CommentWithAuthor[]> => {
    return prisma.comment.findMany({
        where: {
            post: {
                uuid: postUuid,
            }
        },
        include: {
            author: true,
        }
    })
}

const getAllByPostUuidPaginated = (postUuid: string, query: PaginationQuery): Promise<CommentWithAuthor[]> => {
    return prisma.comment.findMany({
        where: {
            post: {
                uuid: postUuid,
            }
        },
        include: {
            author: true,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
    })
}

const countAllByPostUuid = (postUuid: string): Promise<number> => {
    return prisma.comment.count({
        where: {
            post: {
                uuid: postUuid,
            }
        }
    })
}

const getById = (id: bigint): Promise<Comment | null> => {
    return prisma.comment.findUnique({
        where: {
            id: id
        }
    })
}

const getByUuid = (uuid: string): Promise<CommentWithAuthorAndPost | null> => {
    return prisma.comment.findUnique({
        where: {
            uuid: uuid
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
    getAllPaginated,
    getAllByUserUuid,
    getAllByPostUuid,
    getAllByPostUuidPaginated,
    getAllByUserUuidPaginated,
    countAllByPostUuid,
    countAllByUserUuid,
    getById,
    getByUuid,
    create,
    updateByUuid,
    deleteById,
    deleteByUuid
}