import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import verifyToken from "./middleware/verifyToken.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

////////////////////////////////////////////// set up db and start server /////////////////////////////////////////////

const startServer = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log(`Server is listening to the port ${process.env.PORT}`);
        });
    } catch (error) {
        res.status(400).json({
            message: "erroc connecting to the db",
            error: error.message,
        });
    }
};

startServer();
app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", orderRoutes);

app.get("/", (req, res) => {
    return res.status(200).send("Welcome to CraftConnect");
});
