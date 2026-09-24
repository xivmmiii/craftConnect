import Cart from "../models/cartModel.js";
import AppError from "../utils/AppError.js";
import Product from "../models/productModel.js";
import { PUBLIC_PRODUCT_FILTER, getUnavailableReason } from "../utils/productAvailability.js";

// Atomic upsert plus the unique index on buyerID means concurrent requests can't
// create two carts for one buyer.
const getOrCreateCart = async (buyerID) => {
    try {
        return await Cart.findOneAndUpdate(
            { buyerID },
            { $setOnInsert: { items: [] } },
            { upsert: true, returnDocument: "after" },
        );
    } catch (error) {
        if (error.code === 11000) return Cart.findOne({ buyerID });
        throw error;
    }
};

export const viewCart = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can access a cart", 403);
        const buyerID = req.user.id;
        const cart = await Cart.findOne({ buyerID });
        const cartItems = cart?.items || [];
        const products = await Product.find({
            _id: { $in: cartItems.map((item) => item.productID) },
        });
        const productsById = new Map(products.map((product) => [String(product._id), product]));

        // Keep lines whose product was removed or suspended, flagged, so the buyer
        // can see exactly what needs fixing before checkout.
        const items = cartItems.map((item) => {
            const product = productsById.get(String(item.productID));
            const unavailableReason = getUnavailableReason(product, item.qty);
            return {
                _id: item._id,
                productID: product || { _id: item.productID, name: "Item no longer listed" },
                qty: item.qty,
                available: !unavailableReason,
                unavailableReason,
            };
        });
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
        const product = await Product.findOne({ _id: productID, ...PUBLIC_PRODUCT_FILTER, stock: { $gt: 0 } });
        if (!product) throw new AppError("Product not found", 404);
        const cart = await getOrCreateCart(req.user.id);

        const existingItem = cart.items.find(
            (item) => item.productID.toString() === productID,
        );

        if (existingItem) {
            if (existingItem.qty >= product.stock)
                throw new AppError("Requested quantity exceeds available stock", 400);
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
            message: "item quantity decreased",
            items: cart.items,
        });
    } catch (error) {
        next(error);
    }
};

export const updateItemQuantity = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can modify a cart", 403);
        const cart = await Cart.findOne({ buyerID: req.user.id });
        if (!cart) throw new AppError("Cart not found", 404);
        const item = cart.items.find(
            (entry) => entry.productID.toString() === req.params.id,
        );
        if (!item) throw new AppError("Cart item not found", 404);

        const product = await Product.findOne({
            _id: item.productID,
            ...PUBLIC_PRODUCT_FILTER,
        });
        if (!product) throw new AppError("This item is no longer available", 404);
        if (req.body.qty > product.stock)
            throw new AppError("Requested quantity exceeds available stock", 400);

        item.qty = req.body.qty;
        await cart.save();
        return res.status(200).json({ items: cart.items });
    } catch (error) {
        next(error);
    }
};

export const removeCartLine = async (req, res, next) => {
    try {
        if (req.user.role !== "buyer")
            throw new AppError("Only buyers can modify a cart", 403);
        const cart = await Cart.findOne({ buyerID: req.user.id });
        if (!cart) throw new AppError("Cart not found", 404);
        const oldLength = cart.items.length;
        cart.items = cart.items.filter(
            (entry) => entry.productID.toString() !== req.params.id,
        );
        if (cart.items.length === oldLength)
            throw new AppError("Cart item not found", 404);
        await cart.save();
        return res.status(200).json({ items: cart.items });
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
        if (!cart) return res.status(200).json({ items: [] });

        cart.items = [];
        await cart.save();
        return res.status(200).json({
            message: "cart cleared",
        });
    } catch (error) {
        next(error);
    }
};
