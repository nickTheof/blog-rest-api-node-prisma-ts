import prisma from "../prisma/client";
import SecUtil from "../utils/SecUtil";

import {CreateUserSchema, UpdateUserSchema} from "../schemas/user.schema";

export const getAll = async () => {
    return prisma.user.findMany();
}

export const getAllPaginated = async (page: number, pageSize: number) => {
    return prisma.user.findMany({skip: (page - 1) * pageSize, take: pageSize})
}

export const getAllActive = async () => {
    return prisma.user.findMany({where: {isActive: true}});
}

export const countAll = async () => {
    return prisma.user.count();
}

export const getById = async (id: bigint) => {
    return prisma.user.findUniqueOrThrow({where: {id}});
}

export const getByUuid = async (uuid: string) => {
    return prisma.user.findUniqueOrThrow({where: {uuid}});
}

export const create = async (data: CreateUserSchema) => {
    return prisma.user.create({
        data: {
            ...data,
            password: await SecUtil.hashPassword(data.password),
        }
    });
}

export const updateById = async (id: bigint, data: UpdateUserSchema) => {
    if (data.password) {
        data.password = await SecUtil.hashPassword(data.password);
    }
    return prisma.user.update({where: {id}, data});
}

export const updateByUuid = async (uuid: string, data: UpdateUserSchema) => {
    if (data.password) {
        data.password = await SecUtil.hashPassword(data.password);
    }
    return prisma.user.update({where: {uuid}, data});
}

export const deleteById = async (id: bigint) => {
    return prisma.user.delete({where: {id}});
}

export const deleteByUuid = async (uuid: string) => {
    return prisma.user.delete({where: {uuid}});
}