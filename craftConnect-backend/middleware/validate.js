import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(5, "Name should be at least 5 characters long"),
    email: z.email("Please provide a valid email address"),
    password: z
        .string()
        .min(8, "Password should be at least 8 characters long"),
    role: z.enum(
        ["buyer", "seller", "admin"],
        "Role must be either 'buyer', 'seller', or 'admin'",
    ),
    shippingAddress: z.string().optional(),
    shopname: z.string().optional(),
});
