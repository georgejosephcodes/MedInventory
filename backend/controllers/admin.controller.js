const mongoose = require("mongoose");
const User = require("../models/User.model");
const cacheService = require("../services/cacheService");

const USERS_CACHE_KEY = "users:all";

/* =========================
   GET ALL USERS (ADMIN)
========================= */
const getAllUsers = async (req, res) => {
  try {
    // 1. Check cache
    const cachedUsers = await cacheService.get(USERS_CACHE_KEY);
    if (cachedUsers) {
      return res.status(200).json({ users: cachedUsers });
    }

    // 2. Fetch from DB
    const users = await User.find().select("-password").lean();

    // 3. Cache result (5 minutes)
    await cacheService.set(USERS_CACHE_KEY, users, 300);

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

/* =========================
   CREATE USER (ADMIN)
========================= */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true,
      forcePasswordChange: true,
    });

    // invalidate cache
    await cacheService.del(USERS_CACHE_KEY);

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* =========================
   UPDATE USER (ADMIN)
========================= */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { password, ...allowedUpdates } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  invalidate cache
    await cacheService.del(USERS_CACHE_KEY);

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

/* =========================
   DISABLE USER
========================= */
const disableUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({ message: "Admin cannot be disabled" });
    }

    user.isActive = false;
    await user.save();

    //  invalidate cache
    await cacheService.del(USERS_CACHE_KEY);

    res.status(200).json({
      message: "User disabled successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to disable user",
    });
  }
};

/* =========================
   ENABLE USER
========================= */
const enableUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({ message: "Admin cannot be modified" });
    }

    user.isActive = true;
    await user.save();

    // invalidate cache
    await cacheService.del(USERS_CACHE_KEY);

    res.status(200).json({
      message: "User enabled successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to enable user",
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  disableUser,
  enableUser,
};
