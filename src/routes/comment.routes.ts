import {Router} from 'express';
import {validateBody, validateParams, validateQuery} from "../middlewares/validate.middleware";
import {filterCommentsPaginationQuerySchema, paginationQuerySchema} from "../schemas/pagination-query.schema";
import commentController from "../controller/comment.controller";
import {verifyRoles, verifyToken } from "../middlewares/auth.middleware";
import {Role} from "@prisma/client";
import {uuidParamsSchema} from "../schemas/params-validation.schema";
import {commentUpdateSchema} from "../schemas/comment.schema";

const router: Router = Router();

router.use(verifyToken, verifyRoles(Role.ADMIN))
router.get("/", validateQuery(filterCommentsPaginationQuerySchema), commentController.getAllComments)
router.route("/:uuid")
    .get(validateParams(uuidParamsSchema), commentController.getCommentByUuid)
    .delete(validateParams(uuidParamsSchema), commentController.deleteCommentByUuid)
    .patch(validateParams(uuidParamsSchema), validateBody(commentUpdateSchema), commentController.updateCommentByUuid);

router.get("/post/:uuid", validateParams(uuidParamsSchema), validateQuery(filterCommentsPaginationQuerySchema), commentController.getAllCommentsByPostUuid)
router.get("/user/:uuid", validateParams(uuidParamsSchema), validateQuery(filterCommentsPaginationQuerySchema), commentController.getAllCommentsByUserUuid)

export default router;