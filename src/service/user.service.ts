import prisma from "../prisma/client";
import SecUtil from "../utils/SecUtil";
import {User} from '@prisma/client';
import {CreateUserSchema, UpdateUserSchema, PaginationQuery} from "../types/zod-schemas.types";
import {UserForTokenVerification} from "../types/user-auth.types";

const getAll = async (): Promise<User[]> => {
    return prisma.user.findMany();
}

const getAllPaginated = async (query: PaginationQuery): Promise<User[]> => {
    return prisma.user.findMany({skip: (query.page - 1) * query.limit, take: query.limit});
}

const getAllActive = async (): Promise<User[]> => {
    return prisma.user.findMany({where: {isActive: true}});
}

const countAll = async (): Promise<number> => {
    return prisma.user.count();
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

export default {
    getAll,
    getAllPaginated,
    getAllActive,
    countAll,
    getById,
    getByUuid,
    getByEmail,
    create,
    updateById,
    updateByUuid,
    deleteById,
    deleteByUuid
}