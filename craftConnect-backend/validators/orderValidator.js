import { z } from "zod";

export const checkoutSchema = z.object({
    paymentMode: z.enum(["COD", "UPI", "netbanking", "card"]),
    shippingAddress: z.object({
        name: z.string().trim().min(2).max(80),
        email: z.email(),
        street: z.string().trim().min(3).max(160),
        city: z.string().trim().min(2).max(80),
        postcode: z.string().trim().min(3).max(20),
    }),
});
