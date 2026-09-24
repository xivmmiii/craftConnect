import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import { supportsTransactions } from "../config/db.js";
import { PUBLIC_PRODUCT_FILTER, getUnavailableReason } from "../utils/productAvailability.js";

const unavailableError = (issues, fromCart) =>
    new AppError(
        fromCart
            ? `Some items in your bag are unavailable: ${issues.join("; ")}. Update your bag and try again.`
            : `Some items are unavailable: ${issues.join("; ")}.`,
        409,
        "ITEMS_UNAVAILABLE",
    );

// Returns stock for order lines (cancelled/deleted orders, or a failed reservation).
export const releaseStock = async (items, session = null) => {
    try {
        await Promise.all(
            items.map((item) =>
                Product.updateOne({ _id: item.productID }, { $inc: { stock: item.qty } }, { session }),
            ),
        );
    } catch (error) {
        if (session) throw error;
        console.error("Failed to release reserved stock:", error);
    }
};

// Runs work in a transaction when MongoDB supports it, otherwise directly.
export const withOptionalTransaction = async (work) => {
    if (!supportsTransactions()) return work(null);
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await work(session);
        });
        return result;
    } finally {
        await session.endSession();
    }
};

// Stock is decremented with a conditional atomic update, so two orders can never both
// take the last unit. With a replica set this runs inside the caller's transaction;
// without one, reserved stock is released by hand if a later step fails.
export const createOrderWithStock = async ({
    buyerID,
    items,
    paymentMode,
    shippingAddress,
    status = "placed",
    paymentStatus = "pending",
    fromCart = false,
    session = null,
}) => {
    if (!items.length) throw new AppError(fromCart ? "Cart is empty" : "Add at least one item", 400);

    const products = await Product.find({
        _id: { $in: items.map((item) => item.productID) },
    }).session(session);
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const issues = items.flatMap((item) => {
        const product = productsById.get(String(item.productID));
        const reason = getUnavailableReason(product, item.qty);
        return reason ? [`${product?.name ?? "a removed item"} (${reason})`] : [];
    });
    if (issues.length) throw unavailableError(issues, fromCart);

    const reserved = [];
    try {
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findOneAndUpdate(
                { _id: item.productID, ...PUBLIC_PRODUCT_FILTER, stock: { $gte: item.qty } },
                { $inc: { stock: -item.qty } },
                { session, returnDocument: "after" },
            );
            if (!product)
                throw unavailableError([
                    `${productsById.get(String(item.productID))?.name ?? "an item"} (just sold out)`,
                ], fromCart);
            reserved.push(item);
            orderItems.push({
                productID: item.productID,
                productName: product.name,
                sellerID: product.sellerID,
                price: product.price,
                qty: item.qty,
            });
        }

        const [order] = await Order.create(
            [{
                items: orderItems,
                buyerID,
                orderDate: new Date(),
                paymentMode,
                shippingAddress,
                status,
                paymentStatus,
                ...(status === "delivered" ? { deliveryDate: new Date() } : {}),
            }],
            { session },
        );
        return order;
    } catch (error) {
        if (!session) await releaseStock(reserved);
        throw error;
    }
};

export const checkout = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can checkout", 403);
        const { paymentMode, shippingAddress } = req.body;
        const buyerID = req.user.id;

        const placedOrder = await withOptionalTransaction(async (session) => {
            const cart = await Cart.findOne({ buyerID }).session(session);
            const order = await createOrderWithStock({
                buyerID,
                items: cart?.items ?? [],
                paymentMode,
                shippingAddress,
                fromCart: true,
                session,
            });
            cart.items = [];
            if (session) {
                await cart.save({ session });
            } else {
                // The order already exists; a failure here must not undo it.
                await cart.save().catch((error) => console.error("Failed to clear cart after checkout:", error));
            }
            return order;
        });

        return res.status(201).json({
            message: "order placed successfully",
            order: placedOrder,
        });
    } catch (error) {
        next(error);
    }
};

export const BuyerViewOrders = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== "buyer")
            return res.status(403).json({
                message: "unauthorised",
            });
        const buyerID = req.user.id;
        const orders = await Order.find({ buyerID: buyerID })
            .sort({ orderDate: -1 })
            .populate("items.productID", "name imageUrl");
        return res.status(200).json({
            orders: orders,
        });
    } catch (error) {
        next(error);
    }
};

export const SellerViewOrders = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== "seller")
            return res.status(403).json({
                message: "unauthorised",
            });
        const sellerID = req.user.id;
        const orders = await Order.find({ "items.sellerID": sellerID })
            .sort({ orderDate: -1 })
            .lean();
        // A seller only sees their own lines of a multi-seller order, plus what they
        // need to ship them — never other sellers' items or prices.
        const sellerOrders = orders.map((order) => ({
            _id: order._id,
            items: order.items.filter((item) => String(item.sellerID) === sellerID),
            shippingAddress: order.shippingAddress,
            status: order.status,
            paymentMode: order.paymentMode,
            paymentStatus: order.paymentStatus,
            orderDate: order.orderDate,
            deliveryDate: order.deliveryDate,
        }));
        return res.status(200).json({
            list_of_orders: sellerOrders,
        });
    } catch (error) {
        next(error);
    }
};
