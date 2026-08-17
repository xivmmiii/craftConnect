import express from "express";
import { viewCart, addItem } from "../controllers/cartController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/",verifyToken, viewCart);
router.post("/", verifyToken, addItem);

export default router 
