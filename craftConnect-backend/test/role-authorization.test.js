import test from "node:test";
import assert from "node:assert/strict";
import requireRole from "../middleware/requireRole.js";

const responseRecorder = () => ({
    statusCode: 200,
    body: undefined,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    },
});

test("role middleware allows the required role", () => {
    const req = { user: { role: "seller" } };
    const res = responseRecorder();
    let nextCalled = false;

    requireRole("seller")(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
});

test("role middleware rejects other and missing roles", () => {
    for (const req of [{ user: { role: "buyer" } }, {}]) {
        const res = responseRecorder();
        let nextCalled = false;

        requireRole("admin")(req, res, () => { nextCalled = true; });

        assert.equal(nextCalled, false);
        assert.equal(res.statusCode, 403);
        assert.deepEqual(res.body, { message: "unauthorised" });
    }
});
