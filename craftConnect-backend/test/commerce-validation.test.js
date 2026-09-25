import test from "node:test";
import assert from "node:assert/strict";
import { createProductSchema } from "../validators/createProductValidator.js";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cartValidator.js";
import { checkoutSchema } from "../validators/orderValidator.js";

const validProduct = {
    name: "Handmade mug",
    description: "A ceramic mug made by hand.",
    imageUrl: "https://example.com/mug.jpg",
    price: 499,
    category: "Ceramics",
    stock: 6,
};

test("product creation accepts a valid listing and rejects invalid price, stock, and image URL", () => {
    assert.equal(createProductSchema.safeParse(validProduct).success, true);
    assert.equal(createProductSchema.safeParse({ ...validProduct, price: 0 }).success, false);
    assert.equal(createProductSchema.safeParse({ ...validProduct, stock: 1.5 }).success, false);
    assert.equal(createProductSchema.safeParse({ ...validProduct, imageUrl: "javascript:alert(1)" }).success, false);
});

test("cart validators require a Mongo-style product ID and a positive integer quantity", () => {
    assert.equal(addCartItemSchema.safeParse({ productID: "507f1f77bcf86cd799439011" }).success, true);
    assert.equal(addCartItemSchema.safeParse({ productID: "not-an-id" }).success, false);
    assert.equal(updateCartItemSchema.safeParse({ qty: 2 }).success, true);
    assert.equal(updateCartItemSchema.safeParse({ qty: 0 }).success, false);
    assert.equal(updateCartItemSchema.safeParse({ qty: 1.25 }).success, false);
});

test("checkout requires a supported payment method and complete shipping address", () => {
    const checkout = {
        paymentMode: "COD",
        shippingAddress: {
            name: "Sam Maker",
            email: "sam@example.com",
            street: "12 Market Road",
            city: "Jaipur",
            postcode: "302001",
        },
    };

    assert.equal(checkoutSchema.safeParse(checkout).success, true);
    assert.equal(checkoutSchema.safeParse({ ...checkout, paymentMode: "crypto" }).success, false);
    assert.equal(checkoutSchema.safeParse({ ...checkout, shippingAddress: { ...checkout.shippingAddress, street: "" } }).success, false);
});
