import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    full_name: z.string().min(2, "Full name must be at least 2 characters").optional(),
    email: z.string({
        required_error: "Email is required"
    }).email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    role: z.enum(["user", "admin"]).optional()
}).refine(data => data.name !== undefined || data.full_name !== undefined, {
    message: "Name or full_name is required",
    path: ["name"]
});

export const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    full_name: z.string().min(2, "Full name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    role: z.enum(["user", "admin"]).optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
    path: ["body"]
});
