import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string({
        required_error: "Name is required"
    }).min(2, "Name must be at least 2 characters"),
    
    email: z.email({
        required_error: "Email is required",
        message: "Invalid email format"
    })
});

export const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.email({ message: "Invalid email format" }).optional()
}).refine(data => data.name !== undefined || data.email !== undefined, {
    message: "At least one field (name or email) must be provided to update",
    path: ["body"]
});
