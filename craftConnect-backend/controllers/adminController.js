import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { getPagination } from "../utils/pagination.js";
import AppError from "../utils/AppError.js";
import Cart from "../models/cartModel.js";
import {
    createOrderWithStock,
    releaseStock,
    withOptionalTransaction,
} from "./orderController.js";

const OPEN_ORDER_STATUSES = ["placed", "processing", "shipped"];

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    emailID: user.emailID,
    role: user.role,
    shopName: user.shopName,
    shippingAddress: user.shippingAddress,
    isActive: user.isActive,
});

// A seller's listings are visible only while the account is an active seller.
const syncSellerListings = (user) =>
    Product.updateMany(
        { sellerID: user._id },
        { sellerSuspended: !(user.isActive && user.role === "seller") },
    );

export const getDashboardSummary = async (req, res, next) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ message: "unauthorised" });
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const [totalUsers, activeUsers, activeProducts, openOrders, ordersToday] =
            await Promise.all([
                User.countDocuments(),
                User.countDocuments({ isActive: true }),
                Product.countDocuments({ isActive: true }),
                Order.countDocuments({ status: { $in: OPEN_ORDER_STATUSES } }),
                Order.countDocuments({ orderDate: { $gte: startOfDay } }),
            ]);
        return res.status(200).json({
            totalUsers,
            activeUsers,
            activeProducts,
            openOrders,
            ordersToday,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unauthorised",
            });
        const userRole = req.query.role;
        const { page, limit, skip } = getPagination(req.query);
        const filter = {};
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === "true";
        if (userRole) {
            if (!["buyer", "seller", "admin"].includes(userRole))
                throw new AppError("Invalid role", 400);
            filter.role = userRole;
        }
        const usersList = await User.find(filter)
            .select("-password ")
            .sort({ _id: -1 })
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
        next(error);
    }
};
export const getAllProducts = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unauthorised",
            });
        const { page, limit, skip } = getPagination(req.query);
        const filter = {};
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === "true";
        const productList = await Product.find(filter)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .populate("sellerID", "name shopName");
        const totalProducts = await Product.countDocuments(filter);
        return res.status(200).json({
            products: productList,
            totalProducts: totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
        });
    } catch (error) {
        next(error);
    }
};
export const getAllOrders = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== "admin")
            return res.status(403).json({
                message: "unauthorised",
            });
        const filter = {};
        const { page, skip, limit } = getPagination(req.query);
        if (req.query.status) {
            const allowedStatuses = [
                "placed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ];
            if (!allowedStatuses.includes(req.query.status))
                throw new AppError("Invalid order status", 400);
            filter.status = req.query.status;
        }
        const orderList = await Order.find(filter)
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate("buyerID", "name emailID");
        const totalOrders = await Order.countDocuments(filter);
        return res.status(200).json({
            orders: orderList,
            totalOrders: totalOrders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
        });
    } catch (error) {
        next(error);
    }
};

// Deactivating a seller also hides their listings from buyers; reactivating restores them.
const setUserActive = (isActive) => async (req, res, next) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ message: "unauthorised" });
        const user = await User.findById(req.params.id);
        if (!user) throw new AppError("User not found", 404);
        if (user.role === "admin")
            throw new AppError("Admin accounts cannot be changed here", 403);

        user.isActive = isActive;
        await user.save();
        await syncSellerListings(user);

        return res.status(200).json({
            message: `${user.role} ${isActive ? "reactivated" : "deactivated"}`,
            user: { id: user._id, role: user.role, isActive: user.isActive },
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateUser = setUserActive(false);
export const activateUser = setUserActive(true);

// Brings listings in line for sellers deactivated before sellerSuspended existed.
export const syncSuspendedSellers = async () => {
    const inactiveSellers = await User.find({ role: "seller", isActive: false }).distinct("_id");
    await Product.updateMany(
        { sellerID: { $in: inactiveSellers }, sellerSuspended: { $ne: true } },
        { sellerSuspended: true },
    );
};

// ---- Users ----

export const createUser = async (req, res, next) => {
    try {
        const { email, ...fields } = req.body;
        const user = await User.create({ ...fields, emailID: email });
        return res.status(201).json({ message: "user created", user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000)
            return next(new AppError("An account with this email already exists", 409));
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new AppError("User not found", 404);
        const isSelf = String(user._id) === req.user.id;
        if (isSelf && req.body.role && req.body.role !== user.role)
            throw new AppError("You can't change your own role", 403);

        const { email, password, ...fields } = req.body;
        Object.assign(user, fields);
        if (email) user.emailID = email;
        if (password) {
            user.password = password;
            user.tokenVersion = (user.tokenVersion ?? 0) + 1; // sign them out everywhere
        }
        await user.save();
        await syncSellerListings(user);
        return res.status(200).json({ message: "user updated", user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000)
            return next(new AppError("An account with this email already exists", 409));
        next(error);
    }
};

// Orders are kept as history; a deleted seller's listings are hidden for good.
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new AppError("User not found", 404);
        if (String(user._id) === req.user.id)
            throw new AppError("You can't delete your own account", 403);
        if (user.role === "admin")
            throw new AppError("Change this admin's role before deleting the account", 403);

        await Cart.deleteMany({ buyerID: user._id });
        await Product.updateMany({ sellerID: user._id }, { isActive: false, sellerSuspended: true });
        await user.deleteOne();
        return res.status(200).json({ message: "user deleted" });
    } catch (error) {
        next(error);
    }
};

// ---- Products ----

export const createProduct = async (req, res, next) => {
    try {
        const seller = await User.findById(req.body.sellerID);
        if (!seller || seller.role !== "seller")
            throw new AppError("Choose an existing seller for this product", 400);
        const product = await Product.create({
            ...req.body,
            sellerSuspended: !seller.isActive,
        });
        return res.status(201).json({ message: "product created", product });
    } catch (error) {
        next(error);
    }
};

// Also deactivates or reactivates a listing via { isActive }.
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { returnDocument: "after", runValidators: true },
        );
        if (!product) throw new AppError("Product not found", 404);
        return res.status(200).json({ message: "product updated", product });
    } catch (error) {
        next(error);
    }
};

// Past orders keep their own copy of the product name and price.
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) throw new AppError("Product not found", 404);
        await Cart.updateMany({}, { $pull: { items: { productID: product._id } } });
        return res.status(200).json({ message: "product deleted" });
    } catch (error) {
        next(error);
    }
};

// ---- Orders ----

export const createOrder = async (req, res, next) => {
    try {
        const buyer = await User.findById(req.body.buyerID);
        if (!buyer || buyer.role !== "buyer" || !buyer.isActive)
            throw new AppError("Choose an active buyer for this order", 400);
        const order = await withOptionalTransaction((session) =>
            createOrderWithStock({ ...req.body, session }),
        );
        return res.status(201).json({ message: "order created", order });
    } catch (error) {
        next(error);
    }
};

export const updateOrder = async (req, res, next) => {
    try {
        const { status, deliveryDate, ...fields } = req.body;
        const order = await withOptionalTransaction(async (session) => {
            const current = await Order.findById(req.params.id).session(session);
            if (!current) throw new AppError("Order not found", 404);

            const update = { ...fields };
            if (deliveryDate !== undefined) update.deliveryDate = deliveryDate;
            if (status && status !== current.status) {
                if (current.status === "cancelled")
                    throw new AppError("A cancelled order can't be reopened", 400);
                if (status === "cancelled" && current.status === "delivered")
                    throw new AppError("A delivered order can't be cancelled", 400);
                update.status = status;
                if (status === "delivered" && !deliveryDate)
                    update.deliveryDate = new Date();
            }

            // Conditional on the status we read, so a concurrent change can't restock twice.
            const updated = await Order.findOneAndUpdate(
                { _id: current._id, status: current.status },
                { $set: update },
                { session, returnDocument: "after", runValidators: true },
            );
            if (!updated)
                throw new AppError("This order changed meanwhile. Reload and try again.", 409);
            if (update.status === "cancelled") await releaseStock(current.items, session);
            return updated;
        });
        return res.status(200).json({ message: "order updated", order });
    } catch (error) {
        next(error);
    }
};

// Deleting an order that wasn't delivered or cancelled puts its stock back.
export const deleteOrder = async (req, res, next) => {
    try {
        await withOptionalTransaction(async (session) => {
            const order = await Order.findByIdAndDelete(req.params.id, { session });
            if (!order) throw new AppError("Order not found", 404);
            if (OPEN_ORDER_STATUSES.includes(order.status))
                await releaseStock(order.items, session);
        });
        return res.status(200).json({ message: "order deleted" });
    } catch (error) {
        next(error);
    }
};
