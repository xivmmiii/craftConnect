import { z } from "zod";

export const addCartItemSchema = z.object({
    productID: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
});

export const updateCartItemSchema = z.object({
    qty: z.number().int().min(1).max(100000),
});
