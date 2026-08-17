import express from "express";
import {
    viewCart,
    addItem,
    removeItem,
    clearCart,
} from "../controllers/cartController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, viewCart);
router.post("/", verifyToken, addItem);
router.delete("/:id", verifyToken, removeItem);
router.delete("/", verifyToken, clearCart);

export default router;
