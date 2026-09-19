import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
    },
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    stock: {
        required: true,
        type: Number,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
