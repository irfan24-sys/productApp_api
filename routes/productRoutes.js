
import express from "express";

import {
  addProduct,
  getProducts,
  getProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import userAuthCheck from "../middleware/userAuhCheck.js";

import {
  productValidation,
  validateRequest,
} from "../middleware/validators.js";

const router = express.Router();

// ========================================
// GET ALL PRODUCTS
// PUBLIC
// ========================================

router.get(
  "/getAllProduct",
  getProducts
);

// ========================================
// GET SINGLE PRODUCT
// PUBLIC
// ========================================

router.get(
  "/getProduct/:id",
  getProduct
);

// ========================================
// ADD PRODUCT
// LOGIN REQUIRED
// EXPRESS VALIDATION
// ========================================

router.post(
  "/addProduct",
  userAuthCheck,
  productValidation,
  validateRequest,
  addProduct
);

// ========================================
// SELLER PRODUCTS
// LOGIN REQUIRED
// ========================================

router.get(
  "/seller-products",
  userAuthCheck,
  getSellerProducts
);

// ========================================
// UPDATE PRODUCT
// LOGIN REQUIRED
// ========================================

router.put(
  "/updateProduct/:id",
  userAuthCheck,
  updateProduct
);

// ========================================
// DELETE PRODUCT
// LOGIN REQUIRED
// ========================================

router.delete(
  "/deleteProduct/:id",
  userAuthCheck,
  deleteProduct
);

export default router;
