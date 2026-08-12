import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    emailID: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["buyer", "seller", "admin"],
    },
    shippingAddress: {
        type: String,
    },
    shopName: {
        type: String,
    },
});

const User = mongoose.model("User", userSchema);

export default User;
