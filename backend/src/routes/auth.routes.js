import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import protect from "../middlewares/auth.js";
import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
