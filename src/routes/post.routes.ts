import {Router} from 'express';
import {verifyRoles, verifyToken} from "../middlewares/auth.middleware";
import postController from "../controller/post.controller"
import {validateBody, validateQuery} from "../middlewares/validate.middleware";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {postUpdateSchema} from "../schemas/post.schema";

const router:Router = Router();
// All routes require authentication token. Only users with ADMIN Authorization are eligible for general CRUD actions in the Post model
router.use( verifyToken, verifyRoles("ADMIN"))

router.get("/", validateQuery(paginationQuerySchema), postController.getAllPosts);

router.patch("/:uuid", validateBody(postUpdateSchema), postController.updatePostByUuid);

router
    .route("/:uuid")
    .get(postController.getPostByUuid)
    .delete(postController.deletePostByUuid);

export default router;