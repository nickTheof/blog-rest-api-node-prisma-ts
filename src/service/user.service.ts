import prisma from "../prisma/client";
import SecUtil from "../utils/SecUtil";
import {Prisma, User} from '@prisma/client';
import {
    CreateUserSchema,
    UpdateUserSchema,
    FilterUsersPaginationQuery
} from "../types/zod-schemas.types";
import {UserForTokenVerification} from "../types/user-auth.types";
import {generatePaginationQuery} from "../utils/helpers/prisma-predicates.helpers";
import {generateFilterActiveUsersWhere} from "../utils/helpers/prisma-predicates.helpers";

const getAll = async (query: FilterUsersPaginationQuery): Promise<User[]> => {
    const activeWhere: Prisma.UserWhereInput = generateFilterActiveUsersWhere(query.isActive);
    if (!query.paginated) {
        return prisma.user.findMany({where: activeWhere});
    } else {
        const paginationArgs: Prisma.UserFindManyArgs = generatePaginationQuery(query);
        return prisma.user.findMany({
            where: activeWhere,
            ...paginationArgs
        });
    }
}

const countAll = async (isActive?: boolean): Promise<number> => {
    const activeWhere: Prisma.UserWhereInput = generateFilterActiveUsersWhere(isActive);
    return prisma.user.count({
        where: activeWhere,
    });
}

const getById = async (id: bigint): Promise<User | null> => {
    return prisma.user.findUnique({where: {id}});
}

const getByUuid = async (uuid: string): Promise<User | null> => {
    return prisma.user.findUnique({where: {uuid}});
}

const getByEmail = async (email: string): Promise<UserForTokenVerification | null> => {
    return prisma.user.findUnique({where: {email}, select: {uuid: true, email: true, role: true, isActive: true, password: true}});
}

const create = async (data: CreateUserSchema): Promise<User> => {
    return prisma.user.create({
        data: {
            ...data,
            password: await SecUtil.hashPassword(data.password),
        }
    });
}

const updateById = async (id: bigint, data: UpdateUserSchema): Promise<User> => {
    if (data.password) {
        data.password = await SecUtil.hashPassword(data.password);
    }
    return prisma.user.update({where: {id}, data});
}

const updateByUuid = async (uuid: string, data: UpdateUserSchema): Promise<User> => {
    if (data.password) {
        data.password = await SecUtil.hashPassword(data.password);
    }
    return prisma.user.update({where: {uuid}, data});
}

const deleteById = async (id: bigint): Promise<User> => {
    return prisma.user.delete({where: {id}});
}

const deleteByUuid = async (uuid: string): Promise<User> => {
    return prisma.user.delete({where: {uuid}});
}

// softly delete a user
const deleteSoftByUuid = async(uuid: string): Promise<User> => {
    return prisma.user.update({
        where: {uuid},
        data: {
            isActive: false,
            deletedAt: new Date()
        }
    });
};

export default {
    getAll,
    countAll,
    getById,
    getByUuid,
    getByEmail,
    create,
    updateById,
    updateByUuid,
    deleteById,
    deleteByUuid,
    deleteSoftByUuid
}