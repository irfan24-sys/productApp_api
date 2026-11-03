import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import User from "../model/User.js";

const userAuthCheck = async (req, res, next) => {
  // Allow preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    // CHECK AUTHORIZATION HEADER

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new HttpError("Authentication required", 401));
    }

    // CHECK BEARER TOKEN

    if (!authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Invalid authorization format", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new HttpError("Authentication required", 401));
    }

    // VERIFY TOKEN

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // FIND USER

    const user = await User.findById(decodedToken.user_id);

    if (!user) {
      return next(new HttpError("Invalid credentials", 401));
    }

    // STORE USER INFORMATION

    req.userData = {
      userId: user._id.toString(),
      userRole: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);

    return next(new HttpError("Authentication failed", 403));
  }
};

export default userAuthCheck;
