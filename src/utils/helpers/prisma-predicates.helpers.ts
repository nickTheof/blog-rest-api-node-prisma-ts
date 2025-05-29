import {PaginationQuery} from "../../types/zod-schemas.types";
import {PostStatus, Prisma} from "@prisma/client";

export const generatePaginationQuery = (query: PaginationQuery): Prisma.PostFindManyArgs => {
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