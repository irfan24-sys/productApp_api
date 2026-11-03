import Address from "../model/Address.js";


// ADD ADDRESS
export const addAddress = async (req, res, next) => {
  try {
  
    const userId = req.userData.userId;

    const {
      fullName,
      phone,
      houseName,
      street,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !houseName ||
      !street ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    const address = await Address.create({
      userId,
      fullName,
      phone,
      houseName,
      street,
      city,
      state,
      pincode,
    });

 
    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Add Address Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add address",
    });
  }
};
// GET USER ADDRESSES
export const getAddresses = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const addresses = await Address.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get addresses",
    });
  }
};

// UPDATE ADDRESS

export const updateAddress = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const { id } = req.params;

    const updatedAddress =
      await Address.findOneAndUpdate(
        {
          _id: id,
          userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Update Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// DELETE ADDRESS

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const { id } = req.params;

    const deletedAddress =
      await Address.findOneAndDelete({
        _id: id,
        userId,
      });

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};