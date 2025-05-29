import prisma from "../prisma/client";
import {PaginationQuery, ProfileCreateSchema, ProfileUpdateSchema} from "../types/zod-schemas.types";
import {ProfileWithUser} from "../utils/helpers/response.helpers";
import {generatePaginationQuery} from "../utils/helpers/prisma-predicates.helpers";
import { Prisma, Profile } from "@prisma/client";

const getAll = (query: PaginationQuery): Promise<ProfileWithUser[]> => {
    const paginationArgs: Prisma.ProfileFindManyArgs = generatePaginationQuery(query);
    const profileInclude: Prisma.ProfileInclude = {
            user: true
    }
    return prisma.profile.findMany({
        ...paginationArgs,
        include: profileInclude
    })
}

const getById = (id: bigint): Promise<ProfileWithUser | null> => {
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

const getByUserUuid = (userUuid: string): Promise<ProfileWithUser | null> => {
    return prisma.profile.findFirst({
        where: {
            user: {
                uuid: userUuid
            }
        },
        include: {
            user: true,
        }
    })
}

const countAll = (): Promise<number> => {
    return prisma.profile.count()
}


const create = (userUuid: string, data: ProfileCreateSchema): Promise<ProfileWithUser> => {
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

const update = (userId: bigint, data: ProfileUpdateSchema): Promise<ProfileWithUser> => {
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

const updateById  = (id: bigint, data: ProfileUpdateSchema): Promise<ProfileWithUser> => {
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

const deleteById = (id: bigint): Promise<Profile> => {
    return prisma.profile.delete({
        where: {
            id: id
        }
    })
}

const deleteByUserId = (userId: bigint): Promise<Profile> => {
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
    getByUserUuid,
    countAll,
    create,
    update,
    updateById,
    deleteById,
}