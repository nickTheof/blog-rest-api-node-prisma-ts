import {z} from "zod";
import {createUserSchema, updateUserSchema, loginDTOSchema, registerDTOSchema} from "../schemas/user.schema";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {categorySchema} from "../schemas/category.schema";
import {postCreateSchema, postUpdateSchema} from "../schemas/post.schema";

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type LoginDTOSchema = z.infer<typeof loginDTOSchema>;
export type RegisterDTOSchema = z.infer<typeof registerDTOSchema>
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type CategorySchema = z.infer<typeof categorySchema>;
export type PostCreateSchema = z.infer<typeof postCreateSchema>;
export type PostUpdateSchema = z.infer<typeof postUpdateSchema>;