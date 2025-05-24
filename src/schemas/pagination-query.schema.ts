
import { z } from 'zod';

export const PaginationQuerySchema = z.object({
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

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;