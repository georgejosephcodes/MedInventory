// controllers/admin.controller.js
const mongoose = require("mongoose");
const User = require("../models/User.model");

const disableUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot be disabled",
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User disabled successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to disable user",
    });
  }
};

const enableUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot be modified",
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User enabled successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to enable user",
    });
  }
};

module.exports = { disableUser, enableUser };
