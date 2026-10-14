import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { checkoutSchema } from "../validations/order.validation.js";
import { authMiddleware } from "../middlewares/auth.middeware.js";

const router = express.Router();

// Protect checkout with authMiddleware
router.post('/orders/checkout', authMiddleware, validate(checkoutSchema), orderController.checkout);

export default router;
