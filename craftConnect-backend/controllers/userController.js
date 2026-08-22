import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signin = async (req, res) => {
    try {
        const { emailID, password } = req.body;
        const user = await User.findOne({ emailID });
        if (user && user.isActive === true) {
            const password_matches = await bcrypt.compare(
                password,
                user.password,
            );
            if (password_matches) {
                const token = jwt.sign(
                    { id: user._id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" },
                );
                return res.status(200).json({
                    message: "sign in successful",
                    token: token,
                });
            }
        }
        return res.status(401).json({
            message: "wrong id or password",
        });
    } catch (error) {
        return res.status(400).json({
            message: "login unsuccessful",
            error: error.message,
        });
    }
};

export const signup = async (req, res) => {
    try {
        const { name, emailID, password, role, shippingAddress, shopName } =
            req.body;
        const user = await User.create({
            name,
            emailID,
            password,
            role,
            shippingAddress,
            shopName,
        });
        if (user)
            return res.status(201).json({
                name: name,
                emailID: emailID,
                role: role,
                shippingAddress: shippingAddress,
                shopName: shopName,
            });
    } catch (error) {
        res.status(400).json({
            message: "user not created",
            error: error.message,
        });
    }
};
