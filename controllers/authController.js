
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";

// =====================================
// USER REGISTER
// =====================================

export const userRegister = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Normalize values
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = String(role || "user").trim().toLowerCase();

    // Only user and seller can register
    if (!["user", "seller"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // Check email only, regardless of role
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TOKEN_EXPIRY || "1d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      accessToken: token,
    });

  } catch (error) {
    console.error("Register Error:", error);

    // Handle duplicate email index error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login.",
      });
    }

    return next(new HttpError("Internal server error", 500));
  }
};


// =====================================
// USER LOGIN
// =====================================

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user using email only
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("_id firstName lastName email role password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TOKEN_EXPIRY || "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken: token,
    });

  } catch (error) {
    console.error("Login Error:", error);

    return next(new HttpError("Internal server error", 500));
  }
};
