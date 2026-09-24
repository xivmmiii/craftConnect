import { z } from "zod";

const emailFields = {
    email: z.email("Invalid email address").optional(),
    emailID: z.email("Invalid email address").optional(),
};

const requireEmail = (schema) =>
    schema
        .refine((body) => body.email || body.emailID, {
            message: "Email address is required",
            path: ["email"],
        })
        .transform(({ email, emailID, ...body }) => ({
            ...body,
            emailID: (emailID || email).trim().toLowerCase(),
        }));

// bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated.
export const newPassword = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 bytes")
    .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), "Password must contain a letter and a number");

const emailToken = z.string().regex(/^[a-f\d]{64}$/i, "Invalid or expired link");

export const signInSchema = requireEmail(
    z.object({
        ...emailFields,
        password: z.string().min(1, "Password is required").max(200),
    }),
);

export const adminSignUpSchema = requireEmail(
    z.object({
        ...emailFields,
        name: z.string().trim().min(2, "Name is required").max(80),
        password: newPassword,
        setupKey: z.string().min(1, "Admin setup key is required").max(200),
    }),
);

export const signUpSchema = requireEmail(
    z.object({
        ...emailFields,
        name: z.string().trim().min(2, "Name is required").max(80),
        password: newPassword,
        role: z.enum(["buyer", "seller"], "Role must be buyer or seller"),
        shippingAddress: z.string().trim().max(300).optional(),
        shopName: z.string().trim().max(80).optional(),
    }),
);

export const emailOnlySchema = requireEmail(z.object(emailFields));

export const resetPasswordSchema = z.object({
    token: emailToken,
    password: newPassword,
});
