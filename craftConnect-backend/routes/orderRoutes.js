import express from "express";
import { checkout, BuyerViewOrders,SellerViewOrders } from "../controllers/orderController.js";
import verifyToken from '../middleware/verifyToken.js'
import validate from "../middleware/validate.js";
import { checkoutSchema } from "../validators/orderValidator.js";

const router = express.Router();

router.post("/checkout", verifyToken, validate(checkoutSchema), checkout);
router.get("/view/buyer", verifyToken, BuyerViewOrders);
router.get("/view/seller", verifyToken, SellerViewOrders);

export default router;
