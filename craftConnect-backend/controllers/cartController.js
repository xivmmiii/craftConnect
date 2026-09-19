import Cart from "../models/cartModel.js";
import AppError from "../utils/AppError.js";
import Product from "../models/productModel.js";


export const viewCart = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can access a cart", 403);
        const buyerID = req.user.id;
        const cart = await Cart.findOne({ buyerID }).populate("items.productID");
        if (!cart)
            throw new AppError("Empty cart", 404);
        const items = cart.items;
        return res.status(200).json({
            items: items,
        });
    } catch (error) {
        next(error);
    }
};
export const addItem = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can add items to a cart", 403);
        const { productID } = req.body;
        const product = await Product.findOne({ _id: productID, isActive: true });
        if (!product) throw new AppError("Product not found", 404);
        const buyerID = req.user.id;
        const cart = await Cart.findOne({ buyerID: buyerID });

        if (!cart) {
            const newCart = await Cart.create({
                buyerID,
                items: [{ productID, qty: 1 }],
            });

            return res.status(201).json({
                message: "item added",
                cart: newCart,
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.productID.toString() === productID,
            );

            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.items.push({
                    productID,
                    qty: 1,
                });
            }
            await cart.save();
            return res.status(200).json({
                message: "item added",
                cart: cart,
            });
        }
    } catch (error) {
        next(error);
    }
};
export const removeItem = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can modify a cart", 403);
        const buyerID = req.user.id;
        const cart = await Cart.findOne({ buyerID: buyerID });
        if (!cart)
             throw new AppError("Empty cart", 404);

        const { id } = req.params;
        console.log(req.params);
        const product = cart.items.find(
            (item) => item.productID.toString() === id,
        );
        if (!product) throw new AppError("Product not found", 404);

        product.qty--;
        if (product.qty === 0)
            cart.items = cart.items.filter(
                (item) => item.productID.toString() !== id,
            );

        await cart.save();
        return res.status(200).json({
            message: " product deleted",
        });
    } catch (error) {
        next(error);
    }
};
export const clearCart = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can modify a cart", 403);
        const buyerID = req.user.id;
        const cart = await Cart.findOne({
            buyerID: buyerID,
        });
        if (!cart) throw new AppError("Cart not found", 404);

        cart.items = [];
        await cart.save();
        return res.status(200).json({
            message: "cart cleared",
        });
    } catch (error) {
        next(error);
    }
};
