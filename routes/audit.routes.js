const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { getStockLogs } = require("../controllers/audit.controller");

router.get(
  "/stock-logs",
  authMiddleware,
  roleMiddleware("ADMIN", "PHARMACIST"),
  getStockLogs
);

module.exports = router;
