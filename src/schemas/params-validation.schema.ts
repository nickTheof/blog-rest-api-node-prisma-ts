import { z } from 'zod';

export const integerIdParamsSchema = z.object({
    id: z.string()
        .refine((val) => /^\d+$/.test(val) && Number.parseInt(val, 10) > 0, {
            message: "ID must be a positive integer",
        })
        .transform((val) => parseInt(val, 10)),
});

export const uuidParamsSchema = z.object({
    uuid: z.string()
        .uuid("Invalid UUID format. Use 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' format.")
})

export const bigintIdParamSchema = z.object({
    id: z.string()
        .refine((val) => /^\d+$/.test(val) && BigInt(val) > 0n, {
            message: "ID must be a positive bigint",
        })
        .transform((val) => BigInt(val)),
});

export const doubleUuidParamsSchema = z.object({
    uuid: z.string()
        .uuid("Invalid UUID format. Use 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' format."),
    postUuid: z.string()
        .uuid("Invalid UUID format. Use 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' format."),
});

export const doubleUuidCommentParamsSchema = z.object({
    uuid: z.string()
        .uuid("Invalid UUID format. Use 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' format."),
    commentUuid: z.string()
        .uuid("Invalid UUID format. Use 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' format."),
});