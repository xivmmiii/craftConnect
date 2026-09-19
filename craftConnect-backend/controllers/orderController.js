import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export const checkout = async (req, res, next) => {
    let session;
    try {
        session = await mongoose.startSession();
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can checkout", 403);
        const { paymentMode } = req.body;
        if (!["COD", "UPI", "netbanking", "card"].includes(paymentMode))
            throw new AppError("Invalid payment mode", 400);

        const buyerID = req.user.id;
        const cart = await Cart.findOne({
            buyerID: buyerID,
        });
        if (!cart || cart.items.length === 0)
            throw new AppError("Cart is empty", 404);

        const order = [];
        const itemsToOrder = cart.items;
        await session.withTransaction(async () => {
            for (const item of itemsToOrder) {
                const product = await Product.findOne({
                    _id: item.productID,
                    isActive: true,
                }).session(session);
                if (!product || product.stock < item.qty)
                    throw new AppError(
                        "An item is unavailable or out of stock",
                        400,
                    );
                order.push({
                    productID: item.productID,
                    price: product.price,
                    qty: item.qty,
                });
                product.stock -= item.qty;
                await product.save({ session });
            }

            await Order.create(
                [{
                    items: order,
                    buyerID,
                    orderDate: new Date(),
                    paymentMode,
                }],
                { session },
            );
            cart.items = [];
            await cart.save({ session });
        });
        return res.status(200).json({
            message: "order placed successfully",
        });
    } catch (error) {
        next(error);
    } finally {
        if (session) await session.endSession();
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
        const orders = await Order.find({ buyerID: buyerID });
        if (orders.length !== 0)
            return res.status(200).json({
                orders: orders,
            });
        throw new AppError("No Order found", 404);
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
        const sellerProducts = await Product.find({ sellerID });
        const productIDs = sellerProducts.map((product) => product._id);
        const orders = await Order.find({
            "items.productID": { $in: productIDs },
        });
        return res.status(200).json({
            list_of_orders: orders,
        });
    } catch (error) {
        next(error);
    }
};
