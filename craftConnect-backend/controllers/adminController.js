import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import getPagination from "../utils/pagination.js";

export const getAllUsers = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unauthorised",
            });
        const userRole = req.query.role;
        const { page, limit, skip } = getPagination(req.query);
        const filter = {};
        if (req.query.isActive !== "undefined")
            filter.isActive = isActive === "true";
        if (userRole) filter.role = userRole;
        const usersList = await User.find(filter)
            .select("-password ")
            .skip(skip)
            .limit(limit);
        const totalUsers = await User.countDocuments(filter);
        return res.status(200).json({
            users: usersList,
            totalUsers: totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
        });
    } catch (error) {
        return res.status(500).json({
            message: "internal server error",
            error: error.message,
        });
    }
};
export const getAllProducts = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unauthorised",
            });
        const { page, limit, skup } = getPagination(req.query);
        const filter = {};
        if (req.query.isActive !== "undefined")
            filter.isActive = req.query.isActive === "true";
        const productList = await Product.find({ filter })
            .skip(skip)
            .limit(limit);
        const totalProducts = await Product.countDocuments();
        return res.status(200).json({
            products: productList,
            totalProducts: totalProducts,
            currentPge: page,
            totalPages: Math.seil(totalProducts / limit),
        });
    } catch (error) {
        return res.status(500).json({
            message: "internal server error",
            error: error.message,
        });
    }
};
export const getAllOrders = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unathoised",
            });

        const orderList = await Order.find({});
        return res.status(200).json({
            orders: orderList,
        });
    } catch (error) {
        return res.status(500).json({
            message: "internal server error",
            error: error.message,
        });
    }
};

export const removeSeller = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unathoised",
            });
        const sellerID = req.params.id;

        const seller = await User.findById(sellerID);

        if (seller && seller.role === "seller") {
            seller.isActive = false;
            await seller.save();
            return res.status(200).json({ message: "seller deactivated" });
        }
        return res.status(404).json({ message: "seller not found" });
    } catch (error) {
        return res.status(500).json({
            message: "internal server error",
            error: error.message,
        });
    }
};
export const removeProduct = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unathorised",
            });
        const productID = req.params.id;
        const product = await Product.findByIdAndUpdate(
            productID,
            { isActive: false },
            { returnDocument: "after" },
        );
        if (product)
            return res.status(200).json({ message: "product deactivated" });
        return res.status(404).json({ message: "product not found" });
    } catch (error) {
        return res.status(500).json({
            message: "internal server error",
            error: error.message,
        });
    }
};
