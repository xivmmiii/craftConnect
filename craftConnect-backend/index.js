import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());

const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:5173"
).split(",");
app.use(
    cors({
        origin: allowedOrigins,
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
    next();
});

app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

app.get("/", (req, res, next) => {
    return res.status(200).send("Welcome to CraftConnect");
});

const startServer = async () => {
    try {
        await connectDB();
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server is listening to the port ${port}`);
        });
    } catch (error) {
        console.error("Unable to connect to MongoDB:", error);
        process.exitCode = 1;
    }
};

startServer();
