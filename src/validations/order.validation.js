import { z } from 'zod';

export const checkoutSchema = z.object({
    userId: z.number({
        required_error: "User ID is required",
        invalid_type_error: "User ID must be a number"
    }),
    items: z.array(z.object({
        productId: z.number({
            required_error: "Product ID is required"
        }),
        quantity: z.number({
            required_error: "Quantity is required"
        }).min(1, "Quantity must be at least 1")
    })).min(1, "At least one item is required for checkout")
});
