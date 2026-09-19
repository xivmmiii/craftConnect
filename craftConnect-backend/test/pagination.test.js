import test from "node:test";
import assert from "node:assert/strict";
import { getPagination } from "../utils/pagination.js";

test("uses defaults for missing pagination parameters", () => {
    assert.deepEqual(getPagination({}), {
        page: 1,
        limit: 10,
        skip: 0,
    });
});

test("normalizes invalid values and caps the page size", () => {
    assert.deepEqual(getPagination({ page: "-2", limit: "500" }), {
        page: 1,
        limit: 100,
        skip: 0,
    });
});

test("calculates the offset for a valid page", () => {
    assert.deepEqual(getPagination({ page: "3", limit: "20" }), {
        page: 3,
        limit: 20,
        skip: 40,
    });
});
