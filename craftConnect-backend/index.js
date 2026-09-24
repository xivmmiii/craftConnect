import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import validateEnv from "./config/env.js";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { syncSuspendedSellers } from "./controllers/adminController.js";

const app = express();
// Render terminates TLS in front of the app; trust it so req.secure reflects HTTPS.
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "https://craftconnect-gg.web.app",
    "https://craftconnect-gg.firebaseapp.com",
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ["Content-Type"],
    }),
);

// The session lives in a cookie, so reject state-changing requests from foreign
// origins (CSRF). Browsers always send Origin on cross-origin POST/PUT/DELETE.
app.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    if (origin && !allowedOrigins.includes(origin))
        return res.status(403).json({ message: "Origin not allowed" });
    next();
});

app.get("/", (req, res) => {
    return res.status(200).send("Welcome to CraftConnect");
});

app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use(errorHandler);

const startServer = async () => {
    try {
        validateEnv();
        await connectDB();
        await syncSuspendedSellers();
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server is listening to the port ${port}`);
        });
    } catch (error) {
        console.error("Unable to start server:", error.message);
        process.exit(1);
    }
};

startServer();
