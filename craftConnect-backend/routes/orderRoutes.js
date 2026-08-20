import express from "express";
import { checkout, BuyerViewOrders } from "../controllers/orderController.js";
import verifyToken from '../middleware/verifyToken.js'

const router = express.Router();

router.post("/checkout", verifyToken, checkout);
router.get("/view/buyer", verifyToken, BuyerViewOrders);
router.get("/view/seller", verifyToken, BuyerViewOrders);

export default router;
