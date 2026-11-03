
import express from "express";

import {
  signupValidation,
  loginValidation,
  validateRequest,
} from "../middleware/validators.js";

import {
  userRegister,
  userLogin,
} from "../controllers/authController.js";

const router = express.Router();

// ========================================
// SIGNUP WITH VALIDATION
// ========================================

router.post(
  "/signup",
  signupValidation,
  validateRequest,
  userRegister
);

// ========================================
// LOGIN WITH VALIDATION
// ========================================

router.post(
  "/login",
  loginValidation,
  validateRequest,
  userLogin
);

export default router;
