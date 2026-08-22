import express from "express";
import {
    getAllUsers,
    getAllProducts,
    getAllOrders,
    removeProduct,
    removeSeller,
} from "../controllers/adminController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/user", verifyToken, getAllUsers);
router.get("/product", verifyToken, getAllProducts);
router.get("/order", verifyToken, getAllOrders);
router.put("/seller/:id", verifyToken, removeSeller);
router.put("/product/:id", verifyToken, removeProduct);

export default router;
