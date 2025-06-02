import {Router} from 'express';
import {verifyRoles, verifyToken} from "../middlewares/auth.middleware";
import postController from "../controller/post.controller"
import {validateBody, validateQuery, validateParams} from "../middlewares/validate.middleware";
import {filterPostsPaginationQuerySchema, paginationQuerySchema} from "../schemas/pagination-query.schema";
import {postUpdateSchema} from "../schemas/post.schema";
import commentController from "../controller/comment.controller";
import {doubleUuidCommentParamsSchema, uuidParamsSchema} from "../schemas/params-validation.schema";
import {commentCreateSchema, commentUpdateSchema} from "../schemas/comment.schema";

const router:Router = Router();

router.use(verifyToken)
router.route("/:uuid/comments")
    .get(validateParams(uuidParamsSchema), validateQuery(paginationQuerySchema), commentController.getAllCommentsByPostUuid)
    .post(validateParams(uuidParamsSchema), validateBody(commentCreateSchema), commentController.createComment)


router.route("/:uuid/comments/:commentUuid")
    .patch(validateParams(doubleUuidCommentParamsSchema), validateBody(commentUpdateSchema), commentController.updateAuthenticatedUserCommentByUuid)
    .delete(validateParams(doubleUuidCommentParamsSchema), commentController.deleteAuthenticatedUserCommentByUuid)

// All routes require authentication token. Only users with ADMIN Authorization are eligible for general CRUD actions in the Post model
router.use(verifyRoles("ADMIN"))

router.get("/", validateQuery(filterPostsPaginationQuerySchema), postController.getAllPosts);

router.patch("/:uuid", validateParams(uuidParamsSchema), validateBody(postUpdateSchema), postController.updatePostByUuid);

router
    .route("/:uuid")
    .get(validateParams(uuidParamsSchema), postController.getPostByUuid)
    .delete(validateParams(uuidParamsSchema), postController.deletePostByUuid);

export default router;