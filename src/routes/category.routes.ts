import { Router } from "express";
import categoryController from "../controller/category.controller";
import {validateBody, validateQuery} from "../middlewares/validate.middleware";
import {verifyRoles, verifyToken} from "../middlewares/auth.middleware";
import {categorySchema} from "../schemas/category.schema";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";


const router: Router = Router();

// All routes require authentication token. Insert - Update - Delete actions require ADMIN OR EDITOR authorization
router.use (verifyToken)
router.get("/", categoryController.getAllCategories)
router.post("/",
    verifyRoles("ADMIN", "EDITOR"),
    validateBody(categorySchema),
    categoryController.insertCategory);

router.get("/paginated",
    validateQuery(paginationQuerySchema),
    categoryController.getAllCategoriesPaginated);

router.get("/:id", categoryController.getCategoryById)

router.use(verifyRoles("ADMIN", "EDITOR"))
router.route("/:id")
    .patch(validateBody(categorySchema), categoryController.updateCategoryById)
    .delete(categoryController.deleteCategoryById);

export default router;