import { z } from "zod";
export const createProductSchema = z.object({
    name: z.string().min(3).max(15),
    price: z.number().min(1).max(1000000).positive(),
    category: z.string().min(3).max(15),
    stock: z.number().min(1).max(1000000).positive(),
});
