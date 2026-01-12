const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  disableUser,
  enableUser,
} = require("../controllers/admin.controller");

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
