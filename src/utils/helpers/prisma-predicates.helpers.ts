import {PaginationQuery} from "../../types/zod-schemas.types";
import {PostStatus, Prisma} from "@prisma/client";

type findManyArgsPagination = {
    skip?: number,
    take?: number
}

export const generatePaginationQuery = (query: PaginationQuery): findManyArgsPagination  => {
    if (!query.paginated) {
        return {};
    } else {
        return {
            skip: (query.page - 1) * query.limit,
            take: query.limit
        }
    }
}

export const generateFilterStatusWhere = (status?: PostStatus[]): Prisma.PostWhereInput => {
    const where: Prisma.PostWhereInput = {};
    if (status && status.length > 0) {
        where.status = { in: status as PostStatus[] };
    }
    return where;
}

export const generateFilterAuthorWhere = (authorUuid?: string ): Prisma.PostWhereInput => {
    const where: Prisma.PostWhereInput = {};
    if (authorUuid) {
        where.author = { uuid: authorUuid };
    }
    return where;
}


export const generateFilterPostUuidWhere = (uuid?: string ): Prisma.PostWhereInput => {
    const where: Prisma.PostWhereInput = {};
    if (uuid) {
        where.uuid = uuid;
    }
    return where;
}

type activeUsersWhere = {
    isActive?: boolean
}

export const generateFilterActiveUsersWhere = (isActive?: boolean): activeUsersWhere => {
    const where: activeUsersWhere = {};
    if (isActive === undefined) {
        return where;
    }
    where.isActive = isActive;
    return where;
}