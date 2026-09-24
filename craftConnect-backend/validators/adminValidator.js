import { z } from "zod";
import { newPassword } from "./uservalidator.js";
import { createProductSchema } from "./createProductValidator.js";
import { editProductSchema } from "./editProductValidator.js";
import { checkoutSchema } from "./orderValidator.js";

const objectId = (label) => z.string().regex(/^[a-f\d]{24}$/i, `Invalid ${label}`);
const ORDER_STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const userFields = {
    name: z.string().trim().min(2, "Name is required").max(80),
    email: z.email("Invalid email address").transform((email) => email.trim().toLowerCase()),
    role: z.enum(["buyer", "seller", "admin"], "Role must be buyer, seller or admin"),
    shopName: z.string().trim().max(80).optional(),
    shippingAddress: z.string().trim().max(300).optional(),
};

export const adminCreateUserSchema = z.object({ ...userFields, password: newPassword });

export const adminUpdateUserSchema = z
    .object({ ...userFields, password: newPassword })
    .partial()
    .refine((body) => Object.keys(body).length > 0, "Nothing to update");

export const adminCreateProductSchema = createProductSchema.extend({
    sellerID: objectId("seller"),
});

export const adminUpdateProductSchema = editProductSchema
    .extend({ isActive: z.boolean().optional() })
    .refine((body) => Object.keys(body).length > 0, "Nothing to update");

export const adminCreateOrderSchema = checkoutSchema.extend({
    buyerID: objectId("buyer"),
    items: z
        .array(z.object({ productID: objectId("product"), qty: z.number().int().min(1).max(100000) }))
        .min(1, "Add at least one item")
        .max(50)
        .refine(
            (items) => new Set(items.map((item) => item.productID)).size === items.length,
            "Each product can only appear once",
        ),
    status: z.enum(ORDER_STATUSES.filter((status) => status !== "cancelled")).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
});

export const adminUpdateOrderSchema = z
    .object({
        status: z.enum(ORDER_STATUSES),
        paymentStatus: z.enum(PAYMENT_STATUSES),
        deliveryDate: z.iso.date().nullable(),
        shippingAddress: checkoutSchema.shape.shippingAddress,
    })
    .partial()
    .refine((body) => Object.keys(body).length > 0, "Nothing to update");
