import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", authMiddleware, authController.logout);

export const authRouter = router;
export default router;
