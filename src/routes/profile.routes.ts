import { Router } from 'express';
import profileController from "../controller/profile.controller";
import {validateQuery} from "../middlewares/validate.middleware";
import {paginationQuerySchema} from "../schemas/pagination-query.schema";
import {verifyRoles, verifyToken} from "../middlewares/auth.middleware";
import {Role} from "@prisma/client";

const router:Router = Router();
router.use(verifyToken, verifyRoles(Role.ADMIN))
router.get("/", validateQuery(paginationQuerySchema), profileController.getAllProfiles)
router.route("/:id")
    .get(profileController.getProfileById)
    .delete(profileController.deleteProfileById)
    .patch(profileController.updateProfileById);

export default router;
