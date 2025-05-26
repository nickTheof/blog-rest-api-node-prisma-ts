import prisma from '../prisma/client';
import {CategorySchema, PaginationQuery} from "../types/zod-schemas.types";
import {Category} from "@prisma/client";

const getAll = async (): Promise<Category[]> => {
    return prisma.category.findMany();
}

const getAllPaginated =  async (query: PaginationQuery): Promise<Category[]> => {
    return prisma.category.findMany({skip: (query.page - 1) * query.limit, take: query.limit});
}

const countAll = async (): Promise<number> => {
    return prisma.category.count();
}

const getById = async(id: number): Promise<Category | null> => {
    return prisma.category.findUnique({where: {id}});
}

const create = async(data: CategorySchema): Promise<Category> => {
    return prisma.category.create({data})
}

const updateById = async(id: number, data: CategorySchema): Promise<Category> => {
    return prisma.category.update({where: {id}, data});
}

const deleteById = async(id: number): Promise<Category> => {
    return prisma.category.delete({where: {id}});
}

export default {
    getAll,
    getAllPaginated,
    countAll,
    getById,
    create,
    updateById,
    deleteById
}
