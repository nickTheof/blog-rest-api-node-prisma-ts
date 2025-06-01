import {z} from 'zod';
import {Role} from '@prisma/client';

export const userSchema = z.object({
    email: z.string().email("Email has not valid format"),
    password: z.string().min(8).refine((val) => /[a-z]/.test(val), {
        message: 'Must contain lowercase',
    }).refine((val) => /[A-Z]/.test(val), {
        message: 'Must contain uppercase',
    }).refine((val) => /\d/.test(val), {
        message: 'Must contain number',
    }).refine((val) => /[!@#$%^&*]/.test(val), {
        message: 'Must contain special character',
    }),
    isActive: z.boolean().default(true).optional(),
    }
)

export const createUserSchema = userSchema.extend({
    role: z.nativeEnum(Role).optional()
});


export const updateUserSchema = createUserSchema.partial();

export const updateMeSchema = userSchema.partial().strict()

export const loginDTOSchema = z.object({
    email: z.string().email("Email has not valid format"),
    password: z.string().min(8, "Password must contain at least 8 characters")
}).strict("You should provide email and password")

export const registerDTOSchema = z.object({
    email: z.string().email("Email has not valid format"),
    password: z.string()
        .min(8, "Password must contain at least 8 characters")
        .refine(val => /[a-z]/.test(val), { message: 'Must contain lowercase' })
        .refine(val => /[A-Z]/.test(val), { message: 'Must contain uppercase' })
        .refine(val => /\d/.test(val), { message: 'Must contain number' })
        .refine(val => /[!@#$%^&*]/.test(val), { message: 'Must contain special character' }),
    confirmPassword: z.string()
}).strict().superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            path: ['confirmPassword'],
            message: "Passwords don't match",
            code: z.ZodIssueCode.custom
        });
    }
});
