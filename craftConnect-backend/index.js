import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import verifyToken from "./middleware/verifyToken.js";
import jwt from "jsonwebtoken";

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

app.post("/products", verifyToken, async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can add products",
            });

        const { name, price, category } = req.body;
        const sellerID = req.user.id;

        const product = await Product.create({
            name,
            price,
            category,
            sellerID,
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

app.put("/products/:id", verifyToken, async (req, res) => {
    try {
        const role = req.user.role;

        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can update products",
            });

        const { id } = req.params;
        const product = await Product.findById(id); //new:true means updated object willl be returned

        if (product !== null) {
            if (req.user.id !== product.sellerID.toString()) {
                return res.status(403).json({
                    message: "Forbidden: You can only delete your own products",
                });
            }
            const { name, price, category } = req.body;
            product.name = name || product.name;
            product.price = price || product.price;
            product.category = category || product.category;
            await product.save();
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

app.delete("/products/:id", verifyToken, async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can delete products",
            });
        const { id } = req.params;
        const product = await Product.findById(id);

        if (product !== null) {
            if (req.user.id !== product.sellerID.toString()) {
                return res.status(403).json({
                    message: "Forbidden: You can only delete your own products",
                });
            }
            await Product.findByIdAndDelete(id);
            return res.status(204).json({
                //used for no content
                message: "Product deleted successfully",
            });
        }
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

app.post("/signup", async (req, res) => {
    try {
        const { name, emailID, password, role, shippingAddress, shopName } =
            req.body;
        const user = await User.create({
            name,
            emailID,
            password,
            role,
            shippingAddress,
            shopName,
        });
        if (user)
            return res.status(201).json({
                name: name,
                emailID: emailID,
                role: role,
                shippingAddress: shippingAddress,
                shopName: shopName,
            });
    } catch (error) {
        res.status(400).json({
            message: "user not created",
            error: error.message,
        });
    }
});

app.post("/signin", async (req, res) => {
    try {
        const { emailID, password } = req.body;
        const user = await User.findOne({ emailID });
        if (user) {
            const password_matches = await bcrypt.compare(
                password,
                user.password,
            );
            if (password_matches) {
                const token = jwt.sign(
                    { id: user._id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" },
                );
                return res.status(200).json({
                    message: "sign in successful",
                    token: token,
                });
            }
        }
        return res.status(401).json({
            message: "wrong id or password",
        });
    } catch (error) {
        return res.status(400).json({
            message: "login unsuccessful",
            error: error.message,
        });
    }
});
