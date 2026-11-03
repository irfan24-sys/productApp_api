import Product from "../model/product.js";
import HttpError from "../helpers/HttpError.js";

// ADD PRODUCT
export const addProduct = async (
  req,
  res,
  next
) => {
  try {
    // Check authentication
    if (!req.userData) {
      return next(
        new HttpError(
          "Authentication required",
          401
        )
      );
    }
    // Only seller can add product
    if (
      req.userData.userRole !== "seller"
    ) {
      return next(
        new HttpError(
          "Only seller can add product",
          403
        )
      );
    }

    const {
      name,
      description,
      price,
      category,
      image,
      stock,
    } = req.body;

    // Required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      !category
    ) {
      return next(
        new HttpError(
          "All required fields must be provided",
          400
        )
      );
    }

    // Price validation
    if (
      isNaN(Number(price)) ||
      Number(price) <= 0
    ) {
      return next(
        new HttpError(
          "Price must be greater than 0",
          400
        )
      );
    }

    // Stock validation
    if (
      stock !== undefined &&
      (
        isNaN(Number(stock)) ||
        Number(stock) < 0
      )
    ) {
      return next(
        new HttpError(
          "Stock cannot be negative",
          400
        )
      );
    }
    // Create product
    const product =
      new Product({
        userId:
          req.userData.userId,

        name: name.trim(),

        description:
          description.trim(),

        price: Number(price),

        category:
          category.trim(),

        image:
          image || "",

        stock:
          stock !== undefined
            ? Number(stock)
            : 0,

        isDeleted: false,
      });

    await product.save();

    return res.status(201).json({
      success: true,

      message:
        "Product added successfully",

      data: product,
    });

  } catch (error) {
    console.error(
      "Add Product Error:",
      error
    );

    return next(
      new HttpError(
        "Internal server error",
        500
      )
    );
  }
};

// GET ALL PRODUCTS

// Logged out:
//   Shows all products
// Normal user:
//   Shows all products
// Seller:
//   Hides seller's own products
//   Shows other sellers' products
// Newly added products first
// Pagination

export const getProducts = async (
  req,
  res,
  next
) => {
  try {
    // PAGINATION


    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 8,
      1
    );

    const skip =
      (page - 1) * limit;

    // BASE QUERY

    const query = {
      isDeleted: false,
    };

    // HIDE SELLER'S OWN PRODUCTS

    if (
      req.userData &&
      req.userData.userRole ===
      "seller" &&
      req.userData.userId
    ) {
      query.userId = {
        $ne:
          req.userData.userId,
      };
    }

    // COUNT

    const totalProducts =
      await Product.countDocuments(
        query
      );

    // GET PRODUCTS
    // NEWEST FIRST

    const products =
      await Product.find(query)
        .populate(
          "userId",
          "firstName lastName email role"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    // TOTAL PAGES

    const totalPages =
      Math.ceil(
        totalProducts / limit
      );

    // RESPONSE

    return res.status(200).json({
      success: true,

      message:
        "Products fetched successfully",

      data: products,

      pagination: {
        currentPage: page,

        totalPages:
          totalPages,

        totalProducts:
          totalProducts,

        limit: limit,
      },
    });

  } catch (error) {
    console.error(
      "Get Products Error:",
      error
    );

    return next(
      new HttpError(
        "Internal server error",
        500
      )
    );
  }
};
// GET SINGLE PRODUCT
export const getProduct = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.params;

    const product =
      await Product.findOne({
        _id: id,
        isDeleted: false,
      }).populate(
        "userId",
        "firstName lastName email role"
      );

    if (!product) {
      return next(
        new HttpError(
          "Product not found",
          404
        )
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Product fetched successfully",

      data: product,
    });

  } catch (error) {
    console.error(
      "Get Product Error:",
      error
    );

    return next(
      new HttpError(
        "Internal server error",
        500
      )
    );
  }
};

// GET SELLER PRODUCTS
// Seller Dashboard
//
// Shows ONLY current seller's products

export const getSellerProducts =
  async (
    req,
    res,
    next
  ) => {
    try {
      // Authentication
      if (!req.userData) {
        return next(
          new HttpError(
            "Authentication required",
            401
          )
        );
      }

      // Seller only
      if (
        req.userData.userRole !==
        "seller"
      ) {
        return next(
          new HttpError(
            "Only seller can access seller products",
            403
          )
        );
      }

      // Find only current seller products
      const products =
        await Product.find({
          userId:
            req.userData.userId,

          isDeleted: false,
        })
          .populate(
            "userId",
            "firstName lastName email role"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        message:
          "Seller products fetched successfully",

        data: products,
      });

    } catch (error) {
      console.error(
        "Get Seller Products Error:",
        error
      );

      return next(
        new HttpError(
          "Internal server error",
          500
        )
      );
    }
  };

// UPDATE PRODUCT

export const updateProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      // Authentication
      if (!req.userData) {
        return next(
          new HttpError(
            "Authentication required",
            401
          )
        );
      }

      // Seller only
      if (
        req.userData.userRole !==
        "seller"
      ) {
        return next(
          new HttpError(
            "Only seller can update product",
            403
          )
        );
      }

      const { id } =
        req.params;

      const {
        name,
        description,
        price,
        category,
        image,
        stock,
      } = req.body;

      // Find product
      const product =
        await Product.findOne({
          _id: id,

          isDeleted: false,
        });

      if (!product) {
        return next(
          new HttpError(
            "Product not found",
            404
          )
        );
      }

      // OWNERSHIP CHECK

      if (
        !product.userId ||
        product.userId.toString() !==
        req.userData.userId.toString()
      ) {
        return next(
          new HttpError(
            "You are not authorized to update this product",
            403
          )
        );
      }

      // PRICE VALIDATION

      if (
        price !== undefined
      ) {
        if (
          isNaN(Number(price)) ||
          Number(price) <= 0
        ) {
          return next(
            new HttpError(
              "Price must be greater than 0",
              400
            )
          );
        }

        product.price =
          Number(price);
      }

      // NAME

      if (
        name !== undefined
      ) {
        if (
          !name.trim()
        ) {
          return next(
            new HttpError(
              "Product name is required",
              400
            )
          );
        }

        product.name =
          name.trim();
      }

      // DESCRIPTION

      if (
        description !==
        undefined
      ) {
        if (
          !description.trim()
        ) {
          return next(
            new HttpError(
              "Description is required",
              400
            )
          );
        }

        product.description =
          description.trim();
      }

      // CATEGORY

      if (
        category !== undefined
      ) {
        if (
          !category.trim()
        ) {
          return next(
            new HttpError(
              "Category is required",
              400
            )
          );
        }

        product.category =
          category.trim();
      }
      // IMAGE

      if (
        image !== undefined
      ) {
        product.image =
          image;
      }

      // STOCK

      if (
        stock !== undefined
      ) {
        if (
          isNaN(Number(stock)) ||
          Number(stock) < 0
        ) {
          return next(
            new HttpError(
              "Stock cannot be negative",
              400
            )
          );
        }

        product.stock =
          Number(stock);
      }

      // SAVE
      await product.save();

      return res.status(200).json({
        success: true,

        message:
          "Product updated successfully",

        data: product,
      });

    } catch (error) {
      console.error(
        "Update Product Error:",
        error
      );

      return next(
        new HttpError(
          "Internal server error",
          500
        )
      );
    }
  };
  // DELETE PRODUCT

// SOFT DELETE
export const deleteProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      // Authentication
      if (!req.userData) {
        return next(
          new HttpError(
            "Authentication required",
            401
          )
        );
      }

      const { id } =
        req.params;

      // Find active product
      const product =
        await Product.findOne({
          _id: id,

          isDeleted: false,
        });

      if (!product) {
        return next(
          new HttpError(
            "Product not found",
            404
          )
        );
      }

      // ADMIN

      if (
        req.userData.userRole ===
        "admin"
      ) {
        product.isDeleted =
          true;

        await product.save();

        return res.status(200).json({
          success: true,

          message:
            "Product deleted successfully",
        });
      }
      // SELLER

      if (
        req.userData.userRole ===
        "seller"
      ) {
        // Check ownership
        if (
          !product.userId ||
          product.userId.toString() !==
          req.userData.userId.toString()
        ) {
          return next(
            new HttpError(
              "You are not authorized to delete this product",
              403
            )
          );
        }

        // SOFT DELETE

        product.isDeleted =
          true;

        await product.save();

        return res.status(200).json({
          success: true,

          message:
            "Product deleted successfully",
        });
      }
      // NORMAL USER

      return next(
        new HttpError(
          "Only seller or admin can delete product",
          403
        )
      );

    } catch (error) {
      console.error(
        "Delete Product Error:",
        error
      );

      return next(
        new HttpError(
          "Internal server error",
          500
        )
      );
    }
  };