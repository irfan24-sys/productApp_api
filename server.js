
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import cors from "cors";
import path from "path";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// MIDDLEWARE

// CORS configuration
app.use(cors());

// Parse JSON data
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.resolve("uploads"))
);

// ROUTES

app.use("/api/auth", authRoutes);

app.use("/api/product", productRoutes);

app.use("/api/address", addressRoutes);

app.use("/api/order", orderRoutes);

// TEST ROUTE

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HANDY HUB Backend is running!",
  });
});

// ERROR HANDLING

app.use((error, req, res, next) => {
  console.error("ERROR:", error);

  res.status(error.code || 500).json({
    success: false,
    message: error.message || "Something went wrong",
  });
});

// START SERVER

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    console.log("MongoDB connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
