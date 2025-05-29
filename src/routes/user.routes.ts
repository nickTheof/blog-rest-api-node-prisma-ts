import { Router } from 'express';
import userController from '../controller/user.controller';
import postController from "../controller/post.controller";
import commentController from "../controller/comment.controller";
import {verifyToken, verifyRoles} from "../middlewares/auth.middleware";
import {validateBody, validateQuery, validateParams} from "../middlewares/validate.middleware";
import {createUserSchema, updateUserSchema} from "../schemas/user.schema";
import {filterPostsPaginationQuerySchema, filterUsersPaginationQuerySchema, paginationQuerySchema} from "../schemas/pagination-query.schema";
import {postCreateSchema, postUpdateSchema} from "../schemas/post.schema";
import {Role} from "@prisma/client";
import profileController from "../controller/profile.controller";
import {profileCreateSchema, profileUpdateSchema} from "../schemas/profile.schema";
import {uuidParamsSchema, doubleUuidParamsSchema} from "../schemas/params-validation.schema";

const router: Router = Router();

// All routes below require authentication
router.use(verifyToken)

router.route("/me")
    .get(userController.getAuthenticatedUser)
    .patch(validateBody(updateUserSchema), userController.updateAuthenticatedUser)
    .delete(userController.deleteAuthenticatedUser);

router.route("/me/posts")
    .get(validateQuery(filterPostsPaginationQuerySchema), postController.getAllUserPosts)
    .post(validateBody(postCreateSchema), postController.insertPost);


router.route("/me/posts/:uuid")
    .get(validateParams(uuidParamsSchema), postController.getAuthenticatedUserPostByUuid)
    .patch(validateParams(uuidParamsSchema), validateBody(postUpdateSchema), postController.updateAuthenticatedUserPost)
    .delete(validateParams(uuidParamsSchema), postController.authUserDeletePostByUuid);

router.route("/me/profile")
    .get(profileController.getAuthenticatedUserProfile)
    .post(validateBody(profileCreateSchema), profileController.createAuthenticatedUserProfile)
    .patch(validateBody(profileUpdateSchema), profileController.updateAuthenticatedUserProfile)
    .delete(profileController.deleteAuthenticatedUserProfile)

// Only ADMIN users can access the following routes
router.use(verifyRoles(Role.ADMIN));
router.route('/')
    .get(validateQuery(filterUsersPaginationQuerySchema), userController.getAllUsers)
    .post(validateBody(createUserSchema), userController.insertUser)

router.route('/:uuid')
    .get(validateParams(uuidParamsSchema), userController.getUserByUuid)
    .patch(validateParams(uuidParamsSchema), validateBody(updateUserSchema), userController.updateUserByUuid)
    .delete(validateParams(uuidParamsSchema), userController.deleteUserByUuid)

router.get("/:uuid/comments", validateParams(uuidParamsSchema), validateQuery(paginationQuerySchema), commentController.getAllCommentsByUserUuid)

router.get("/:uuid/posts", validateParams(uuidParamsSchema), validateQuery(filterPostsPaginationQuerySchema), postController.getAllUserPostsByUuid)
router.route("/:uuid/posts/:postUuid")
    .get(validateParams(doubleUuidParamsSchema), postController.getPostByUserUuidAndPostUuid)
    .delete(validateParams(doubleUuidParamsSchema), postController.deletePostByUserUuidAndPostUuid)
    .patch(validateParams(doubleUuidParamsSchema), validateBody(postUpdateSchema), postController.updatePostByUserUuidAndPostUuid);

export default router;