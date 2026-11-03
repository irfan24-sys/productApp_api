
import express from "express";

import {
  placeOrder,
  getMyOrders,
  getSellerOrders,
} from "../controllers/orderController.js";

import userAuthCheck from "../middleware/userAuhCheck.js";

const router = express.Router();

// Place a new order
router.post(
  "/place-order",
  userAuthCheck,
  placeOrder
);

// Get logged-in customer's orders
router.get(
  "/my-orders",
  userAuthCheck,
  getMyOrders
);

// Get orders belonging to the logged-in seller
router.get(
  "/seller-orders",
  userAuthCheck,
  getSellerOrders
);

export default router;
