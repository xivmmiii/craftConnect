import { z } from "zod";
export const editProductSchema = z.object({
    name: z.string().trim().min(3).max(80).optional(),
    description: z.string().trim().max(1000).optional(),
    imageUrl: z.url({ protocol: /^https?$/ }).optional(),
    price: z.number().positive().max(1000000).optional(),
    category: z.string().trim().min(2).max(40).optional(),
    stock: z.number().int().min(0).max(1000000).optional(),
});
