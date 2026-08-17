import Cart from "../models/cartModel.js";

export const viewCart = async (req, res) => {
    try {
        const buyerID = req.user.id;
        const cart = await Cart.findOne({ buyerID: buyerID });
        if (!cart)
            return res.status(404).json({
                message: "cart is empty",
            });
        const items = cart.items;
        return res.status(200).json({
            items: items,
        });
    } catch (error) {
        return res.status(400).json({
            message: "bad request",
            error: error.message,
        });
    }
};
export const addItem = async (req, res) => {
    try {
        const { productID } = req.body;
        const buyerID = req.user.id;
        const cart = await Cart.findOne({ buyerID: buyerID });

        if (!cart) {
            const newCart = await Cart.create({
                buyerID,
                items: [{ productID, qty: 1 }],
            });

            return res.status(200).json({
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
        res.status(500).json({
            message: "internal server error",
            error: error.message,
        });
    }
};
export const removeItem = async () => {};
export const clearCart = async () => {};


