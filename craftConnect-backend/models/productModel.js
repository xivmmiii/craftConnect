import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
    },
    imageUrl: {
        type: String,
        trim: true,
        default: "",
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
    // Set while the seller's account is deactivated by an admin. Kept separate from
    // isActive so reactivating the seller restores exactly the listings they had live.
    sellerSuspended: {
        type: Boolean,
        default: false,
    },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
