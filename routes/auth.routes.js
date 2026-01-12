const express = require("express");
const router = express.Router();

const {
  login,
  register,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// PUBLIC
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// PROTECTED
router.get("/me", authMiddleware, getMe);

// ADMIN ONLY
router.post(
  "/register",
  authMiddleware,
  roleMiddleware("ADMIN"),
  register
);

module.exports = router;
