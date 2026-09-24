import express from "express";
import {
    getAllUsers,
    getAllProducts,
    getAllOrders,
    deactivateUser,
    activateUser,
    getDashboardSummary,
    createUser,
    updateUser,
    deleteUser,
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    updateOrder,
    deleteOrder,
} from "../controllers/adminController.js";
import verifyToken from "../middleware/verifyToken.js";
import requireRole from "../middleware/requireRole.js";
import validate from "../middleware/validate.js";
import {
    adminCreateUserSchema,
    adminUpdateUserSchema,
    adminCreateProductSchema,
    adminUpdateProductSchema,
    adminCreateOrderSchema,
    adminUpdateOrderSchema,
} from "../validators/adminValidator.js";
import { AdminSignin, AdminSignup } from "../controllers/userController.js";
import { adminSignUpSchema, signInSchema } from "../validators/uservalidator.js";

const router = express.Router();

// Public: registered before the admin-only guard below.
router.post("/signup", validate(adminSignUpSchema), AdminSignup);
router.post("/signin", validate(signInSchema), AdminSignin);

router.use(verifyToken, requireRole("admin"));

router.get("/summary", getDashboardSummary);

router.get("/user", getAllUsers);
router.post("/user", validate(adminCreateUserSchema), createUser);
router.put("/user/:id", validate(adminUpdateUserSchema), updateUser);
router.delete("/user/:id", deleteUser);
router.put("/user/:id/deactivate", deactivateUser);
router.put("/user/:id/activate", activateUser);

router.get("/product", getAllProducts);
router.post("/product", validate(adminCreateProductSchema), createProduct);
router.put("/product/:id", validate(adminUpdateProductSchema), updateProduct);
router.delete("/product/:id", deleteProduct);

router.get("/order", getAllOrders);
router.post("/order", validate(adminCreateOrderSchema), createOrder);
router.put("/order/:id", validate(adminUpdateOrderSchema), updateOrder);
router.delete("/order/:id", deleteOrder);

export default router;
