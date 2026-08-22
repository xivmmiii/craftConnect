import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    isActive: {
        default: true,
        type: Boolean,
    },
});

////////cannot use arrow function here, because it does not have areference tot his
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

export default User;
