import express from "express";
import { Signin, Signup } from "../controllers/userController.js";
import validate from "../middleware/validate.js";
import { signUpSchema } from "../validators/uservalidator.js";

const router = express.Router();

router.post("/Signin", Signin);
router.post("/Signup", validate(signUpSchema), Signup);

export default router;
