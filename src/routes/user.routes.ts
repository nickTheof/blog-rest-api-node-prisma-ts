import { Router } from 'express';
import {insertUser, getAllUsers, getUserByUuid, updateUserByUuid, deleteUserByUuid, getAllUsersPaginated} from '../controller/user.controller';
import {validateBody, validateQuery} from "../middlewares/validate.middleware";
import {createUserSchema, updateUserSchema} from "../schemas/user.schema";
import {PaginationQuerySchema} from "../schemas/pagination-query.schema";

const router = Router();

router.route('/')
    .get(getAllUsers)
    .post(validateBody(createUserSchema), insertUser)

router.get('/paginated', validateQuery(PaginationQuerySchema), getAllUsersPaginated)

router.route('/:uuid')
    .get(getUserByUuid)
    .patch(validateBody(updateUserSchema), updateUserByUuid)
    .delete(deleteUserByUuid)

export default router;