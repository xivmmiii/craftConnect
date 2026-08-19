import mongoose, { mongo } from "mongoose";

const orderSchema = mongoose.Schema({
    items: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            qty: {
                type: Number,
                required: true,
            },
        },
    ],
    buyerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderDate: {
        type: Date,
        required: true,
    },
    deliveryDate: {
        type: Date,
    },
    paymentMode: {
        enum: ["COD", "UPI", "netbanking", "card"],
        required: true,
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
