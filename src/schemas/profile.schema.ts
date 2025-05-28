import {z} from 'zod';

const profileCreateSchema = z.object({
    firstname: z.string().min(2,"Firstname must be at least 2 characters long").optional(),
    lastname: z.string().min(2,"Lastname must be at least 2 characters long").optional(),
    bio: z.string().min(2,"Bio description must be at least 2 characters long"),
    picUrl: z.string().optional(),
})

const profileUpdateSchema = profileCreateSchema.partial();

const profileParamsSchema = z.object({
    id: z.string().transform((val) => parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Profile id must be a positive integer",
        }),
})

export {profileCreateSchema, profileUpdateSchema, profileParamsSchema};