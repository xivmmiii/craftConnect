import express from "express";
import {
    Signin,
    Signup,
    Signout,
    getMe,
    forgotPassword,
    resetPassword,
} from "../controllers/userController.js";
import validate from "../middleware/validate.js";
import verifyToken from "../middleware/verifyToken.js";
import {
    signInSchema,
    signUpSchema,
    emailOnlySchema,
    resetPasswordSchema,
} from "../validators/uservalidator.js";

const router = express.Router();

router.post("/Signin", validate(signInSchema), Signin);
router.post("/Signup", validate(signUpSchema), Signup);
router.post("/Signout", Signout);
router.get("/me", verifyToken, getMe);
router.post("/forgot-password", validate(emailOnlySchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
