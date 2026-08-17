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
export const addItem = async () => {};
export const removeItem = async () => {};
export const clearCart = async () => {};
