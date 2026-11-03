import jwt from "jsonwebtoken";
import User from "../model/User.js";

const optionalUserAuthCheck = async (req, res, next) => {
  // ========================================
  // OPTIONS REQUEST
  // ========================================

  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;

    // ========================================
    // NO TOKEN
    //
    // This is allowed because this middleware
    // is OPTIONAL.
    // ========================================

    if (!authHeader) {
      req.userData = null;
      return next();
    }

    // ========================================
    // INVALID AUTH FORMAT
    // ========================================

    if (!authHeader.startsWith("Bearer ")) {
      req.userData = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      req.userData = null;
      return next();
    }

    // ========================================
    // VERIFY TOKEN
    // ========================================

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findById(
      decodedToken.user_id
    );

    // If token belongs to a deleted/non-existing user,
    // treat request as logged out.
    if (!user) {
      req.userData = null;
      return next();
    }

    // ========================================
    // SAVE USER INFORMATION
    // ========================================

    req.userData = {
      userId: user._id.toString(),
      userRole: user.role,
    };

    next();

  } catch (error) {
    // ========================================
    // INVALID / EXPIRED TOKEN
    //
    // Don't block public product viewing.
    // Treat the user as logged out.
    // ========================================

    console.log(
      "Optional authentication:",
      error.message
    );

    req.userData = null;

    next();
  }
};

export default optionalUserAuthCheck;