import { Router } from 'express';
import authController from "../controller/auth.controller";
import {validateBody} from "../middlewares/validate.middleware";
import {registerDTOSchema} from "../schemas/user.schema";

const router:Router = Router();


router.post("/login", authController.login)
router.post("/register", validateBody(registerDTOSchema), authController.register)

export default router;