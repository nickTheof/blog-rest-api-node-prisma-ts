import { z } from 'zod';
import {PostStatus} from "@prisma/client";

export const postCreateSchema = z.object({
    title: z.string().min(2, "Title must contain at least 2 characters"),
    description: z.string().min(2, "Description must contain at least 2 characters"),
    status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT).optional(),
    categories: z.array(z.number()).optional(),

})

export const postUpdateSchema = postCreateSchema.partial();