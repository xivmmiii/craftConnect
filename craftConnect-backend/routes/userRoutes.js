import express from "express";
import { signin, signup } from "../controllers/userController.js";
import validate from "../middleware/validate.js";
import { signUpSchema } from "../validators/uservalidator.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", validate(signUpSchema), signup);

export default router;
