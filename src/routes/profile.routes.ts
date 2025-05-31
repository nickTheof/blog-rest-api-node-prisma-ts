import { Router } from 'express';
import profileController from "../controller/profile.controller";
import {validateQuery, validateParams, validateBody} from "../middlewares/validate.middleware";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {verifyRoles, verifyToken} from "../middlewares/auth.middleware";
import {Role} from "@prisma/client";
import {bigintIdParamSchema} from "../schemas/params-validation.schema";
import {profileUpdateSchema} from "../schemas/profile.schema";

const router:Router = Router();
router.use(verifyToken, verifyRoles(Role.ADMIN))
router.get("/", validateQuery(paginationQuerySchema), profileController.getAllProfiles)
router.route("/:id")
    .get(validateParams(bigintIdParamSchema), profileController.getProfileById)
    .delete(validateParams(bigintIdParamSchema), profileController.deleteProfileById)
    .patch(validateParams(bigintIdParamSchema), validateBody(profileUpdateSchema), profileController.updateProfileById);

export default router;
