
import mongoose from "mongoose";
import Product from "../model/product.js";
import OrderSummary from "../model/OrderSummary.js";

// PLACE ORDER
export const placeOrder = async (req, res) => {
  try {
    const userId = req.userData?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to place an order",
      });
    }

    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.fullName ||
      !deliveryAddress.phone ||
      !deliveryAddress.houseName ||
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete delivery address",
      });
    }

    const validPaymentMethods = [
      "upi",
      "phonepe",
      "googlepay",
      "cod",
    ];

    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Validate product IDs and quantities
    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity",
        });
      }
    }

    // Reject duplicate product entries
    const productIds = items.map((item) =>
      String(item.productId)
    );

    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate products are not allowed",
      });
    }

    // Fetch products from MongoDB
    const products = await Product.find({
      _id: { $in: productIds },
      isDeleted: false,
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
    }

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(
        String(item.productId)
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }

      // Always use database price
      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}`,
        });
      }

      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product._id,
        sellerId: product.userId,
        name: product.name,

        // Save original product image path
        image: product.image || "",

        category: product.category || "",
        price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // Create order
    const order = await OrderSummary.create({
      userId,
      items: orderItems,
      totalAmount,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        houseName: deliveryAddress.houseName,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
      },
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "confirmed",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

// GET LOGGED-IN CUSTOMER'S ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.userData?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view your orders",
      });
    }

    const orders = await OrderSummary.find({ userId })
      .populate({
        path: "items.productId",
        select: "name image category",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// GET LOGGED-IN SELLER'S ORDERS
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userData?.userId;
    const sellerRole = req.userData?.userRole;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view orders",
      });
    }

    if (sellerRole !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can view seller orders",
      });
    }

    const orders = await OrderSummary.find({
      "items.sellerId": sellerId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const sellerOrders = orders.map((order) => {
      const sellerItems = (order.items || []).filter(
        (item) =>
          String(item.sellerId) === String(sellerId)
      );

      const sellerSubtotal = sellerItems.reduce(
        (total, item) =>
          total +
          Number(
            item.subtotal ??
              Number(item.price || 0) *
                Number(item.quantity || 0)
          ),
        0
      );

      return {
        _id: order._id,
        userId: order.userId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: sellerItems,
        sellerSubtotal,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully",
      count: sellerOrders.length,
      data: sellerOrders,
    });
  } catch (error) {
    console.error("Get Seller Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller orders",
    });
  }
};
