import { Router } from "express";
import categoryController from "../controller/category.controller";
import {validateBody, validateQuery} from "../middlewares/validate.middleware";
import {verifyRoles, verifyToken} from "../middlewares/auth.middleware";
import {categorySchema} from "../schemas/category.schema";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {Role} from "@prisma/client";

const router: Router = Router();

// All routes below require authentication
router.use (verifyToken)
router.route("/")
    .get(validateQuery(paginationQuerySchema), categoryController.getAllCategories)
    .post(verifyRoles(Role.ADMIN, Role.EDITOR),
        validateBody(categorySchema),
        categoryController.insertCategory);

router.get("/:id", categoryController.getCategoryById)

// Only ADMIN - EDITOR users can access the following routes
router.use(verifyRoles(Role.ADMIN, Role.EDITOR))
router.route("/:id")
    .patch(validateBody(categorySchema), categoryController.updateCategoryById)
    .delete(categoryController.deleteCategoryById);

export default router;