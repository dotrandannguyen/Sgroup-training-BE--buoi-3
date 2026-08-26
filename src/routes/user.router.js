import express from "express";
import { userController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema, updateUserSchema } from "../validations/user.validation.js";

const router = express.Router();

// GET: Fetch all users
router.get('/users', userController.getAll);

// GET: Fetch user by id
router.get('/users/:id', userController.getById);

// POST: Create a new user (with Zod Validation)
router.post('/users', validate(createUserSchema), userController.create);

// PATCH: Update a user (with Zod Validation)
router.patch('/users/:id', validate(updateUserSchema), userController.update);
// DELETE: Delete a user
router.delete('/users/:id', userController.delete);

export default router;

