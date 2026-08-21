import express from "express";
import {
    getAllUsers,
    getAllProducts,
    getAllOrders,
    removeProduct,
    removeSeller,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/user", verifyToken, getAllUsers);
router.get("/product", verifyToken, getAllProducts);
router.get("/order", verifyToken, getAllOrders);
router.delete("/seller/:id", verifyToken, removeSeller);
router.delete("/product/:id", verifyToken, removeProduct);

export default router;
