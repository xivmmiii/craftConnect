import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(2, "Name is required"),
    emailID: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["buyer", "seller", "admin"]),
    shippingAddress: z.string().optional(),
    shopName: z.string().optional(),
});
