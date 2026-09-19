import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authorization token is required",
        });
    }

    try {
        const token = authHeader.slice("Bearer ".length).trim();
        if (!token) {
            return res.status(401).json({
                message: "Authorization token is required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("isActive");
        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "User account is inactive",
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        next(error);
    }
};

export default verifyToken;
