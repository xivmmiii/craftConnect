import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import Product from "./models/productModel.js";

const app = express();
app.use(express.json());

const port = 5000;

////////////////////////////////////////////// DB SETUP /////////////////////////////////////////////

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDb connected successfully");
        app.listen(port, () => {
            console.log(`the server is running on port ${port}`);
        });
    } catch (error) {
        console.log("MongoDB coudn't be connected to\n", error.message);
    }
};
connectDB();

app.get("/", (req, res) => {
    return res.status(200).send("Welcome to CraftConnect");
});

app.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
        });
    }
});
app.get("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const products = await Product.findById(id);
        if (products !== null) return res.status(200).json(products);
        return res.status(404).json({
            message: "Product not found",
        });
    } catch (error) {
        res.status(400).json({
            message: "Bad request",
            error: error.message,
        });
    }
});

app.post("/products", async (req, res) => {
    try {
        console.log(req.body);
        const { name, price, category } = req.body;

        const product = await Product.create({
            name,
            price,
            category,
        });

        if (product)
            return res.status(201).json({
                message: "Product added successfully",
                product: product,
            });
    } catch (error) {
        res.status(400).json({
            message: "Bad request",
            error: error.message,
        });
    }
});

app.put("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price,category} = req.body;
        const product = await Product.findByIdAndUpdate(
            id,
            { name, price, category },
            { returnDocument: "after" },
        ); //new:true means updated object willl be returned
        if (product !== null) {
            return res.status(200).json({
                message: "Product updated successfully",
            });
        }
        return res.status(404).json({
            message: "product not found",
        });
    } catch (error) {
        res.status(400).json({
            message: "Bad request",
            error: error.message,
        });
    }
});

app.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (product !== null)
            return res.status(204).json({
                //used for no content
                message: "Product deleted successfully",
            });
        return res.status(404).json({
            message: "product not found",
        });
    } catch (error) {
        res.status(400).json({
            message: "bad request",
            error: error.message,
        });
    }
});
