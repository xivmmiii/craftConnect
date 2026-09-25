import test from "node:test";
import assert from "node:assert/strict";
import { getUnavailableReason, PUBLIC_PRODUCT_FILTER } from "../utils/productAvailability.js";

test("public product filter excludes inactive listings and suspended sellers", () => {
    assert.deepEqual(PUBLIC_PRODUCT_FILTER, { isActive: true, sellerSuspended: { $ne: true } });
});

test("availability checks cover inactive, suspended, empty, and insufficient stock", () => {
    assert.equal(getUnavailableReason(null, 1), "no longer available");
    assert.equal(getUnavailableReason({ isActive: false, stock: 5 }, 1), "no longer available");
    assert.equal(getUnavailableReason({ isActive: true, sellerSuspended: true, stock: 5 }, 1), "no longer available");
    assert.equal(getUnavailableReason({ isActive: true, stock: 0 }, 1), "out of stock");
    assert.equal(getUnavailableReason({ isActive: true, stock: 2 }, 3), "only 2 left");
    assert.equal(getUnavailableReason({ isActive: true, stock: 2 }, 2), null);
});
