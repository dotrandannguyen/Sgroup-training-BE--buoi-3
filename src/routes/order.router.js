import express from "express";
import { orderController } from "../controllers/order.controller.js";

const router = express.Router();

router.post('/orders/checkout', orderController.checkout);

export default router;
