import {z} from "zod";
import {createUserSchema, updateUserSchema, loginDTOSchema, registerDTOSchema} from "../schemas/user.schema";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {categorySchema} from "../schemas/category.schema";
import {postCreateSchema, postUpdateSchema} from "../schemas/post.schema";
import {profileCreateSchema, profileUpdateSchema} from "../schemas/profile.schema";
import {commentCreateSchema, commentUpdateSchema} from "../schemas/comment.schema";
import {filterPostsPaginationQuerySchema, filterUsersPaginationQuerySchema, filterCommentsPaginationQuerySchema} from "../schemas/pagination-query.schema";

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type LoginDTOSchema = z.infer<typeof loginDTOSchema>;
export type RegisterDTOSchema = z.infer<typeof registerDTOSchema>
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type FilterPostsPaginationQuery = z.infer<typeof filterPostsPaginationQuerySchema>;
export type FilterUsersPaginationQuery = z.infer<typeof filterUsersPaginationQuerySchema>;
export type FilterCommentsPaginationQuery = z.infer<typeof filterCommentsPaginationQuerySchema>;
export type CategorySchema = z.infer<typeof categorySchema>;
export type PostCreateSchema = z.infer<typeof postCreateSchema>;
export type PostUpdateSchema = z.infer<typeof postUpdateSchema>;
export type ProfileCreateSchema = z.infer<typeof profileCreateSchema>;
export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;
export type CommentCreateSchema = z.infer<typeof commentCreateSchema>;
export type CommentUpdateSchema = z.infer<typeof commentUpdateSchema>;