import {z} from 'zod';

export const categorySchema = z.object({
    name: z.string().min(3, "Name must contain at least 3 characters"),
})
