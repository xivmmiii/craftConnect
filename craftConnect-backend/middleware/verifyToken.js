import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { AUTH_COOKIE } from "../utils/authCookie.js";

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.[AUTH_COOKIE];
    if (!token) {
        return res.status(401).json({
            message: "Please sign in to continue",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
        const user = await User.findById(decoded.id).select(
            "isActive role tokenVersion",
        );
        // tokenVersion is bumped on password reset, which revokes every older session.
        if (
            !user ||
            !user.isActive ||
            (user.tokenVersion ?? 0) !== (decoded.tv ?? 0)
        ) {
            return res.status(401).json({
                message: "Your session is no longer valid. Please sign in again.",
            });
        }

        req.user = { id: String(user._id), role: user.role };
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Invalid or expired session" });
        }
        next(error);
    }
};

export default verifyToken;
