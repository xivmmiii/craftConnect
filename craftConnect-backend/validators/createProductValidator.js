import { z } from "zod";
export const createProductSchema = z.object({
    name: z.string().trim().min(3).max(80),
    description: z.string().trim().max(1000).optional(),
    imageUrl: z.url({ protocol: /^https?$/ }).optional(),
    price: z.number().positive().max(1000000),
    category: z.string().trim().min(2).max(40),
    stock: z.number().int().min(0).max(1000000),
});
