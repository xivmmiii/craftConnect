import test from "node:test";
import assert from "node:assert/strict";
import { signInSchema, signUpSchema, resetPasswordSchema } from "../validators/uservalidator.js";

test("sign-up accepts buyer and seller accounts and normalizes email", () => {
    const result = signUpSchema.safeParse({
        email: "Maker@Example.com",
        name: "  Sam Maker  ",
        password: "craftwork8",
        role: "seller",
        shopName: "Sam's Studio",
    });

    assert.equal(result.success, true);
    assert.equal(result.data.emailID, "maker@example.com");
    assert.equal(result.data.name, "Sam Maker");
    assert.equal("email" in result.data, false);
});

test("public sign-up rejects admin roles and weak passwords", () => {
    const adminRole = signUpSchema.safeParse({
        emailID: "admin@example.com",
        name: "Admin User",
        password: "craftwork8",
        role: "admin",
    });
    const weakPassword = signUpSchema.safeParse({
        emailID: "buyer@example.com",
        name: "Buyer User",
        password: "password",
        role: "buyer",
    });

    assert.equal(adminRole.success, false);
    assert.equal(weakPassword.success, false);
});

test("sign-in accepts emailID and reset links require a 64-character token", () => {
    assert.equal(signInSchema.safeParse({ emailID: "buyer@example.com", password: "anything" }).success, true);
    assert.equal(resetPasswordSchema.safeParse({ token: "a".repeat(64), password: "newpass8" }).success, true);
    assert.equal(resetPasswordSchema.safeParse({ token: "short", password: "newpass8" }).success, false);
});
