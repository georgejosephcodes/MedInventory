const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getAllUsers,
  createUser,
  updateUser,
  disableUser,
  enableUser,
} = require("../controllers/admin.controller");

// 🔐 ADMIN ONLY — USER MANAGEMENT

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllUsers
);

router.post(
  "/users",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createUser
);

router.put(
  "/users/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateUser
);

router.patch(
  "/users/:id/disable",
  authMiddleware,
  roleMiddleware("ADMIN"),
  disableUser
);

router.patch(
  "/users/:id/enable",
  authMiddleware,
  roleMiddleware("ADMIN"),
  enableUser
);

module.exports = router;
