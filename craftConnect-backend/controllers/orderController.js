import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";

export const checkout = async (req, res) => {
    try {
        const buyerID = req.user.id;
        const cart = await Cart.findOne({
            buyerID: buyerID,
        });
        if (!cart)
            return res.status(404).json({
                message: "cart is empty",
            });
        const order = [];
        const itemsToOrder = cart.items;
        for (const item of itemsToOrder) {
            const product = await Product.findById(item.productID);
            if (product.stock < item.qty)
                return res.status(404).json({
                    message: "item out of stock, cannot proceed checkout",
                });
        }
        for (const item of itemsToOrder) {
            const product = await Product.findById(item.productID);
            const placedItem = {
                productID: item.productID,
                price: product.price,
                qty: item.qty,
            };
            order.push(placedItem);
            product.stock = product.stock - item.qty;
            await product.save();
        }
        const { paymentMode } = req.body;

        await Order.create({
            items: order,
            buyerID,
            orderDate: new Date(),
            paymentMode: paymentMode,
        });
        cart.items = [];
        await cart.save();
        return res.status(200).json({
            message: "order placed successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const BuyerViewOrders = async (req, res) => {
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
        return res.status(404).json({
            message: "no order history",
        });
    } catch (error) {
        next(error);
    }
};

export const SellerViewOrders = async (req, res) => {
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
