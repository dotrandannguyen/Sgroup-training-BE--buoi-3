import { z } from 'zod';

export const checkoutSchema = z.object({
    userId: z.number({ invalid_type_error: "User ID must be a number" }).int().positive().optional(),
    productId: z.number({ invalid_type_error: "Product ID must be a number" }).int().positive().optional(),
    quantity: z.number({ invalid_type_error: "Quantity must be a number" }).int().min(1, "Quantity must be at least 1").optional(),
    items: z.array(z.object({
        productId: z.number({
            required_error: "Product ID is required",
            invalid_type_error: "Product ID must be a number"
        }).int().positive(),
        quantity: z.number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number"
        }).int().min(1, "Quantity must be at least 1")
    })).min(1, "At least one item is required for checkout").optional()
}).refine(data => {
    const hasItems = Array.isArray(data.items) && data.items.length > 0;
    const hasSingle = data.productId !== undefined && data.quantity !== undefined;
    return hasItems || hasSingle;
}, {
    message: "Either 'items' array or both 'productId' and 'quantity' must be provided",
    path: ["items"]
});
