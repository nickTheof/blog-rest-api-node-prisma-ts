import { Router } from 'express';
import profileController from "../controller/profile.controller";
import {validateQuery, validateParams} from "../middlewares/validate.middleware";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {profileParamsSchema} from "../schemas/profile.schema";
import {verifyRoles, verifyToken} from "../middlewares/auth.middleware";
import {Role} from "@prisma/client";

const router:Router = Router();
router.use(verifyToken, verifyRoles(Role.ADMIN))
router.get("/", validateQuery(paginationQuerySchema), profileController.getAllProfiles)
router.route("/:id")
    .get(validateParams(profileParamsSchema), profileController.getProfileById)
    .delete(validateParams(profileParamsSchema), profileController.deleteProfileById)
    .patch(validateParams(profileParamsSchema), profileController.updateProfileById);

export default router;
