import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";
const router = express.Router();
router.post("/register", authController.register);
router.post("/login", authController.login);
export const authRouter = router;
