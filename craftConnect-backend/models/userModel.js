import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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


////////cannot use arrow function here, because it does not have areference tot his
userSchema.pre("save", async function (next) { 
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model("User", userSchema);

export default User;
