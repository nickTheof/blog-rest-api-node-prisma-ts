import { Router } from "express";
import {validateBody, validateQuery} from "../middlewares/validate.middleware";
import {categorySchema} from "../schemas/category.schema";
import {getAllCategories, getCategoryById, insertCategory, updateCategoryById, deleteCategoryById, getAllCategoriesPaginated} from "../controller/category.controller";
import {PaginationQuerySchema} from "../schemas/pagination-query.schema";
const router = Router();

router.route("/")
    .get(getAllCategories)
    .post(validateBody(categorySchema), insertCategory);                 ;

router.get("/paginated", validateQuery(PaginationQuerySchema), getAllCategoriesPaginated);

router.route("/:id")
    .get(getCategoryById)
    .patch(validateBody(categorySchema), updateCategoryById)
    .delete(deleteCategoryById);

export default router;