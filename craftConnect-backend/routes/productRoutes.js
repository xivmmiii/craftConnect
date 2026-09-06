import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import validate from "../middleware/validate.js";
import { createProductSchema } from "../validators/createProductValidator.js";
import { editProductSchema } from "../validators/editProductValidator.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, validate(createProductSchema), createProduct);
router.put("/:id", verifyToken, validate(editProductSchema), updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
