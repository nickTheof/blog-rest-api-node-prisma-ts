import prisma from "../prisma/client";
import {PaginationQuery, ProfileCreateSchema, ProfileUpdateSchema} from "../types/zod-schemas.types";
import {ProfileWithUser} from "../utils/helpers/response.helpers";

const getAll = () => {
    return prisma.profile.findMany({
        include: {
            user: true
        }
    });
}

const getById = (id: bigint) => {
    return prisma.profile.findUnique({
        where: {id},
        include: {
            user: true
        }
    })
}

const getByUserId = (userId: bigint): Promise<ProfileWithUser | null> => {
    return prisma.profile.findUnique({
        where: {
            userId: userId
        },
        include: {
            user: true
        }
    })
}

const getAllPaginated = (query: PaginationQuery) => {
    return prisma.profile.findMany({
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
            user: true
        }
    })
}

const countAll = () => {
    return prisma.profile.count()
}

const countAllPaginated = (query: PaginationQuery) => {
    return prisma.profile.count({
        skip: (query.page - 1) * query.limit,
        take: query.limit
    })
}

const create = (userUuid: string, data: ProfileCreateSchema) => {
    return prisma.profile.create({
        data: {
            ...data,
            user: {
                connect: {
                    uuid: userUuid
                }
            }
        },
        include: {
            user: true
        }
    })
}

const update = (userId: bigint, data: ProfileUpdateSchema) => {
    return prisma.profile.update({
        where: {
            userId: userId
        },
        data: {
            ...data
        },
        include: {
            user: true
        }
    })
}

const updateById  = (id: bigint, data: ProfileUpdateSchema) => {
    return prisma.profile.update({
        where: {
            id: id
        },
        data: {
            ...data
        },
        include: {
            user: true
        }
    })
}

const deleteById = (id: bigint) => {
    return prisma.profile.delete({
        where: {
            id: id
        }
    })
}

const deleteByUserId = (userId: bigint) => {
    return prisma.profile.delete({
        where: {
            userId: userId
        }
    })
}

export default {
    getAll,
    getById,
    getByUserId,
    getAllPaginated,
    countAll,
    countAllPaginated,
    create,
    update,
    updateById,
    deleteById,
}