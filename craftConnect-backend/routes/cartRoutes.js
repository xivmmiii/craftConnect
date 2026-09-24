import express from "express";
import {
    viewCart,
    addItem,
    removeItem,
    removeCartLine,
    updateItemQuantity,
    clearCart,
} from "../controllers/cartController.js";
import verifyToken from "../middleware/verifyToken.js";
import validate from "../middleware/validate.js";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cartValidator.js";

const router = express.Router();

router.get("/", verifyToken, viewCart);
router.post("/", verifyToken, validate(addCartItemSchema), addItem);
router.put("/:id", verifyToken, validate(updateCartItemSchema), updateItemQuantity);
router.delete("/item/:id", verifyToken, removeCartLine);
router.delete("/:id", verifyToken, removeItem);
router.delete("/", verifyToken, clearCart);

export default router;
