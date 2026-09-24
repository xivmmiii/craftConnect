import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    items: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            sellerID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
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
    shippingAddress: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        postcode: { type: String, required: true },
    },
    status: {
        type: String,
        enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
        default: "placed",
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
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
        type: String,
        enum: ["COD", "UPI", "netbanking", "card"],
        required: true,
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],        
    },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
