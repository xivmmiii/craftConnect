import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    buyerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            qty: {
                type: Number,
                required: true,
            },
        },
    ],
});
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
