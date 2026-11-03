
import express from "express";

import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

import userAuthCheck from "../middleware/userAuhCheck.js";

import {
  addressValidation,
  validateRequest,
} from "../middleware/validators.js";

const router = express.Router();

// ========================================
// ADD ADDRESS
// LOGIN REQUIRED + VALIDATION
// ========================================

router.post(
  "/add",
  userAuthCheck,
  addressValidation,
  validateRequest,
  addAddress
);

// ========================================
// GET ALL ADDRESSES
// LOGIN REQUIRED
// ========================================

router.get(
  "/",
  userAuthCheck,
  getAddresses
);

// ========================================
// UPDATE ADDRESS
// LOGIN REQUIRED + VALIDATION
// ========================================

router.put(
  "/:id",
  userAuthCheck,
  addressValidation,
  validateRequest,
  updateAddress
);

// ========================================
// DELETE ADDRESS
// LOGIN REQUIRED
// ========================================

router.delete(
  "/:id",
  userAuthCheck,
  deleteAddress
);

export default router;
