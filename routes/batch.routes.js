const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  stockIn,
  stockOut,
  getBatchesByMedicine,
} = require("../controllers/batch.controller");

// GET batches by medicine
router.get("/", authMiddleware, getBatchesByMedicine);

// Stock IN → PHARMACIST
router.post(
  "/stock-in",
  authMiddleware,
  roleMiddleware("PHARMACIST"),
  stockIn
);

// Stock OUT → STAFF & PHARMACIST
router.post(
  "/stock-out",
  authMiddleware,
  roleMiddleware("STAFF", "PHARMACIST"),
  stockOut
);

module.exports = router;
