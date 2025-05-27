import { z } from 'zod';

export const postCreateSchema = z.object({
    title: z.string().min(2, "Title must contain at least 2 characters"),
    description: z.string().min(2, "Description must contain at least 2 characters"),
    published: z.boolean().optional(),
    categories: z.array(z.number()).optional(),

})

export const postUpdateSchema = z.object({
    title: z.string().min(2, "Title must contain at least 2 characters").optional(),
    description: z.string().min(2, "Description must contain at least 2 characters").optional(),
    published: z.boolean().optional(),
    categories: z.array(z.number()).optional(),
})