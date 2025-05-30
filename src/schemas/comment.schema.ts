import { z } from 'zod';
import {CommentStatus} from "@prisma/client";

export const commentCreateSchema = z.object({
    title: z.string().min(2, "Comment must contain at least 2 characters"),
    status: z.nativeEnum(CommentStatus).default(CommentStatus.ACTIVE).optional(),
})

export const commentUpdateSchema = commentCreateSchema.partial();