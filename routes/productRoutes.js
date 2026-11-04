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
import upload from "../middleware/fileUpload.js";

import {
  productValidation,
  validateRequest,
} from "../middleware/validators.js";

const router = express.Router();

// GET ALL PRODUCTS
router.get(
  "/getAllProduct",
  getProducts
);

// GET SINGLE PRODUCT
router.get(
  "/getProduct/:id",
  getProduct
);

// ADD PRODUCT
router.post(
  "/addProduct",
  userAuthCheck,
  upload.single("image"),
  productValidation,
  validateRequest,
  addProduct
);

// GET SELLER PRODUCTS
router.get(
  "/seller-products",
  userAuthCheck,
  getSellerProducts
);

// UPDATE PRODUCT
router.put(
  "/updateProduct/:id",
  userAuthCheck,
  upload.single("image"),
  updateProduct
);

// DELETE PRODUCT
router.delete(
  "/deleteProduct/:id",
  userAuthCheck,
  deleteProduct
);

export default router;