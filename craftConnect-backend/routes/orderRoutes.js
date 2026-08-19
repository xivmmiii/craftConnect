import express from "express";
import { checkout } from "../controllers/orderController.js";
import verifyToken from '../middleware/verifyToken.js'

const router = express.Router();

router.post("/", verifyToken, checkout);

export default router;
