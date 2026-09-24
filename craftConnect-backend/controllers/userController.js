import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import AppError from "../utils/AppError.js";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookie.js";
import { createEmailToken, hashToken } from "../utils/tokens.js";
import { sendMail, appUrl } from "../utils/mailer.js";

const RESET_TTL_MS = 30 * 60 * 1000;

// Compared against when the email is unknown so sign-in takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync("craftconnect-timing-equaliser", 10);

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    emailID: user.emailID,
    role: user.role,
    shopName: user.shopName,
});

// Same error and timing whether the email is unknown, the password is wrong, or the
// account is inactive, so sign-in can't be used to discover accounts.
const authenticate = async ({ emailID, password }) => {
    const user = await User.findOne({ emailID });
    const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !passwordMatches || user.isActive !== true)
        throw new AppError("Wrong email or password", 401);
    return user;
};

export const Signin = async (req, res, next) => {
    try {
        const user = await authenticate(req.body);
        setAuthCookie(req, res, user);
        return res.status(200).json({
            message: "sign in successful",
            user: publicUser(user),
        });
    } catch (error) {
        next(error);
    }
};

export const Signup = async (req, res, next) => {
    try {
        const { name, emailID, password, role, shippingAddress, shopName } = req.body;
        const user = await User.create({
            name,
            emailID,
            password,
            role,
            shippingAddress,
            shopName,
        });

        setAuthCookie(req, res, user);
        return res.status(201).json({
            message: "sign up successful",
            user: publicUser(user),
        });
    } catch (error) {
        if (error.code === 11000)
            return next(new AppError("An account with this email already exists", 409));
        next(error);
    }
};

// Compares hashes so the check takes the same time however much of the key matches.
const matchesAdminSignupKey = (provided) => {
    const expected = process.env.ADMIN_SIGNUP_KEY;
    if (!expected) return false;
    const digest = (value) => crypto.createHash("sha256").update(value).digest();
    return crypto.timingSafeEqual(digest(provided), digest(expected));
};

// Only people who know the server's ADMIN_SIGNUP_KEY can create admin accounts; without
// that variable the route is switched off.
export const AdminSignup = async (req, res, next) => {
    try {
        if (!process.env.ADMIN_SIGNUP_KEY)
            throw new AppError("Admin sign-up is turned off on this server", 403);
        if (!matchesAdminSignupKey(req.body.setupKey))
            throw new AppError("Invalid admin setup key", 403);

        const { name, emailID, password } = req.body;
        const user = await User.create({ name, emailID, password, role: "admin" });

        setAuthCookie(req, res, user);
        return res.status(201).json({
            message: "admin account created",
            user: publicUser(user),
        });
    } catch (error) {
        if (error.code === 11000)
            return next(new AppError("An account with this email already exists", 409));
        next(error);
    }
};

// Like Signin, but only admin accounts get in; others get the usual generic error.
export const AdminSignin = async (req, res, next) => {
    try {
        const user = await authenticate(req.body);
        if (user.role !== "admin") throw new AppError("Wrong email or password", 401);

        setAuthCookie(req, res, user);
        return res.status(200).json({
            message: "sign in successful",
            user: publicUser(user),
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ emailID: req.body.emailID, isActive: true });
        if (user) {
            const { token, hash, expires } = createEmailToken(RESET_TTL_MS);
            user.passwordResetTokenHash = hash;
            user.passwordResetExpires = expires;
            await user.save();
            await sendMail({
                to: user.emailID,
                subject: "Reset your CraftConnect password",
                text: `Hi ${user.name},\n\nReset your password here:\n${appUrl(`/reset-password#token=${token}`)}\n\nThis link expires in 30 minutes. If you didn't ask for this, you can ignore this email.`,
            });
        }
        return res.status(200).json({
            message: "If an account exists for that email, a reset link is on its way.",
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({
            passwordResetTokenHash: hashToken(req.body.token),
            passwordResetExpires: { $gt: new Date() },
        });
        if (!user || !user.isActive)
            throw new AppError("This reset link is invalid or has expired", 400);

        user.password = req.body.password;
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        user.tokenVersion = (user.tokenVersion ?? 0) + 1; // sign out every existing session
        await user.save();

        clearAuthCookie(req, res);
        return res.status(200).json({
            message: "Password updated. Please sign in with your new password.",
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) throw new AppError("User not found", 404);
        return res.status(200).json({ user: publicUser(user) });
    } catch (error) {
        next(error);
    }
};

export const Signout = (req, res) => {
    clearAuthCookie(req, res);
    return res.status(200).json({ message: "signed out" });
};
