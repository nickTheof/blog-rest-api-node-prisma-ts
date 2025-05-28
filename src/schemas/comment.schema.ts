import { z } from 'zod';

export const commentCreateSchema = z.object({
    title: z.string().min(2, "Comment must contain at least 2 characters"),
})

export const commentUpdateSchema = commentCreateSchema.partial();