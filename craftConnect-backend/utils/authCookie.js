import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "cc_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

// Over HTTPS the frontend (web.app) and API (onrender.com) are different sites, so the
// cookie must be SameSite=None + Secure, and Partitioned (CHIPS) so browsers that block
// third-party cookies still keep it. Plain-HTTP localhost dev is same-site, so Lax works.
const cookieOptions = (req) => {
    const secure = req.secure;
    return {
        httpOnly: true,
        secure,
        sameSite: secure ? "none" : "lax",
        ...(secure ? { partitioned: true } : {}),
        path: "/",
    };
};

export const signToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role, tv: user.tokenVersion ?? 0 },
        process.env.JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" },
    );

export const setAuthCookie = (req, res, user) => {
    res.cookie(AUTH_COOKIE, signToken(user), { ...cookieOptions(req), maxAge: SESSION_MS });
};

export const clearAuthCookie = (req, res) => {
    res.clearCookie(AUTH_COOKIE, cookieOptions(req));
};
