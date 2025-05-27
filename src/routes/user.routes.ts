import { Router } from 'express';
import userController from '../controller/user.controller';
import postController from "../controller/post.controller";
import {verifyToken, verifyRoles} from "../middlewares/auth.middleware";
import {validateBody, validateQuery} from "../middlewares/validate.middleware";
import {createUserSchema, updateUserSchema} from "../schemas/user.schema";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {postCreateSchema, postUpdateSchema} from "../schemas/post.schema";
import {Role} from "@prisma/client";
import profileController from "../controller/profile.controller";
import {profileCreateSchema, profileUpdateSchema} from "../schemas/profile.schema";

const router: Router = Router();

// All routes below require authentication
router.use(verifyToken)

router.route("/me")
    .get(userController.getAuthenticatedUser)
    .patch(validateBody(updateUserSchema), userController.updateAuthenticatedUser)
    .delete(userController.deleteAuthenticatedUser);

router.route("/me/posts")
    .get(validateQuery(paginationQuerySchema), postController.getAllUserPosts)
    .post(validateBody(postCreateSchema), postController.insertPost);


router.route("/me/posts/:uuid")
    .get(postController.getAuthenticatedUserPostByUuid)
    .patch(validateBody(postUpdateSchema), postController.updateAuthenticatedUserPost)
    .delete(postController.authUserDeletePostByUuid);

router.route("/me/profile")
    .get(profileController.getAuthenticatedUserProfile)
    .post(validateBody(profileCreateSchema), profileController.createAuthenticatedUserProfile)
    .patch(validateBody(profileUpdateSchema), profileController.updateAuthenticatedUserProfile)
    .delete(profileController.deleteAuthenticatedUserProfile)

// Only ADMIN users can access the following routes
router.use(verifyRoles(Role.ADMIN));
router.route('/')
    .get(validateQuery(paginationQuerySchema), userController.getAllUsers)
    .post(validateBody(createUserSchema), userController.insertUser)

router.route('/:uuid')
    .get(userController.getUserByUuid)
    .patch(validateBody(updateUserSchema), userController.updateUserByUuid)
    .delete(userController.deleteUserByUuid)

router.get("/:uuid/posts", validateQuery(paginationQuerySchema), postController.getAllUserPostsByUuid)
router.route("/:uuid/posts/:postUuid")
    .get(postController.getPostByUserUuidAndPostUuid)
    .delete(postController.deletePostByUserUuidAndPostUuid)
    .patch(validateBody(postUpdateSchema), postController.updatePostByUserUuidAndPostUuid);

export default router;