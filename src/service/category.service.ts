import prisma from '../prisma/client';
import {CategorySchema, PaginationQuery} from "../types/zod-schemas.types";
import {Category, Prisma} from "@prisma/client";
import {generatePaginationQuery} from "../utils/helpers/prisma-predicates.helpers";

const getAll = async (query: PaginationQuery): Promise<Category[]> => {
    const paginationArgs: Prisma.CategoryFindManyArgs = generatePaginationQuery(query);
    if (!query.paginated) {
        return prisma.category.findMany();
    } else {
        return prisma.category.findMany({
            ...paginationArgs
        });
    }
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
    countAll,
    getById,
    create,
    updateById,
    deleteById
}
