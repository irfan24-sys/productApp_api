import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
dotenv.config();

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());

// ========================================
// ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/product", productRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
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
    // Connect MongoDB first
    await connectDB();

    console.log("MongoDB connected successfully");

    // Start server only
    // after MongoDB connects
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    process.exit(1);
  }
};

startServer();
