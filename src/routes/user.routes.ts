import { Router } from 'express';
import userController from '../controller/user.controller';
import postController from "../controller/post.controller";
import {verifyToken, verifyRoles} from "../middlewares/auth.middleware";
import {validateBody, validateQuery} from "../middlewares/validate.middleware";
import {createUserSchema, updateUserSchema} from "../schemas/user.schema";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {postCreateSchema, postUpdateSchema} from "../schemas/post.schema";

const router: Router = Router();

router.use(verifyToken)

router.post("/me/posts", verifyToken, validateBody(postCreateSchema), postController.insertPost)

// All routes require authentication token. Only users with ADMIN Authorization are eligible for CRUD actions in the User model
router.use(verifyToken, verifyRoles("ADMIN"));
router.route('/')
    .get(userController.getAllUsers)
    .post(validateBody(createUserSchema), userController.insertUser)

router.get('/paginated', validateQuery(paginationQuerySchema), userController.getAllUsersPaginated)

router.route('/:uuid')
    .get(userController.getUserByUuid)
    .patch(validateBody(updateUserSchema), userController.updateUserByUuid)
    .delete(userController.deleteUserByUuid)

export default router;