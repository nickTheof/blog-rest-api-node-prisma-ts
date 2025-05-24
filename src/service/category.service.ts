import prisma from '../prisma/client';
import {CategorySchema} from "../schemas/category.schema";

export const getAll = async () => {
    return prisma.category.findMany();
}

export const getAllPaginated = async (page: number, pageSize: number) => {
    return prisma.category.findMany({skip: (page - 1) * pageSize, take: pageSize});
}

export const countAll = async () => {
    return prisma.category.count();
}

export const getById = async(id: number) => {
    return prisma.category.findUniqueOrThrow({where: {id}});
}

export const create = async(data: CategorySchema) => {
    return prisma.category.create({data})
}

export const updateById = async(id: number, data: CategorySchema) => {
    return prisma.category.update({where: {id}, data});
}

export const deleteById = async(id: number) => {
    return prisma.category.delete({where: {id}});
}
