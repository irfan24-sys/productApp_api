import { body, validationResult } from "express-validator";

// SIGNUP VALIDATION

export const signupValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),

  body("lastName").trim().notEmpty().withMessage("Last name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters"),

  body("role")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["user", "seller"])
    .withMessage("Invalid user role"),
];

// LOGIN VALIDATION

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string"),
];

// ADD PRODUCT VALIDATION

export const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0")
    .toFloat(),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Product category is required")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),

  body("stock")
    .optional({ values: "undefined" })
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer")
    .toInt(),

  body("image")
    .optional({ values: "falsy" })
    .trim()
    .isURL({ require_protocol: true })
    .withMessage("Image must be a valid URL"),
];

// ADDRESS VALIDATION

export const addressValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .bail()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must contain exactly 10 digits"),

  // House name / Building
  body("houseName")
    .trim()
    .notEmpty()
    .withMessage("House name or building is required")
    .bail()
    .isLength({ max: 150 })
    .withMessage("House name cannot exceed 150 characters"),

  // Street / Locality
  body("street")
    .trim()
    .notEmpty()
    .withMessage("Street or locality is required")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Street cannot exceed 150 characters"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters"),

  body("pincode")
    .trim()
    .notEmpty()
    .withMessage("PIN code is required")
    .bail()
    .matches(/^[0-9]{6}$/)
    .withMessage("PIN code must contain exactly 6 digits"),
];

// VALIDATE REQUEST MIDDLEWARE

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};
