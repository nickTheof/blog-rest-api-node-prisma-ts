
import { z } from 'zod';
import {CommentStatus, PostStatus} from "@prisma/client";

export const paginationQuerySchema = z.object({
    paginated: z.string().default("false").transform(val => val === "true"),
    page: z
        .string()
        .default("1")
        .transform((val) => parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Page must be a positive integer",
        }),
    limit: z
        .string()
        .default("50")
        .transform((val) => parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Limit must be a positive integer",
        }),
}).strict();

export const filterPostsPaginationQuerySchema = paginationQuerySchema.extend(({
    status: z.union([z.nativeEnum(PostStatus), z.array(z.nativeEnum(PostStatus))]).optional()
        .transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
}))

export const filterUsersPaginationQuerySchema = paginationQuerySchema.extend(({
    isActive: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .optional()
}))

export const filterCommentsPaginationQuerySchema = paginationQuerySchema.extend(({
    status: z.union([z.nativeEnum(CommentStatus), z.array(z.nativeEnum(CommentStatus))]).optional()
        .transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined)
}))