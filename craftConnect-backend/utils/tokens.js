import crypto from "node:crypto";

export const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

// Only the hash is stored, so a database leak doesn't expose usable links.
export const createEmailToken = (ttlMs) => {
    const token = crypto.randomBytes(32).toString("hex");
    return { token, hash: hashToken(token), expires: new Date(Date.now() + ttlMs) };
};
