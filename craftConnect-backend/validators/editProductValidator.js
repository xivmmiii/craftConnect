import { z } from "zod";
export const editProductSchema = z.object({
    name: z.string().min(3).max(15).optional(),
    price: z.number().min(1).max(1000000).positive().optional(),
    category: z.string().min(3).max(15).optional(),    
    stock: z.number().min(1).max(1000000).positive().optional(),
    isActive: z.boolean().optional(),
});
