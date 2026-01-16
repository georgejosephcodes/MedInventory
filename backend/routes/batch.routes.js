const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  stockIn,
  stockOut,
  getAllBatches,
  getBatchesByMedicine,
} = require("../controllers/batch.controller");

/**
 * DASHBOARD — all active batches
 */
router.get("/", authMiddleware, getAllBatches);

/**
 * INVENTORY — batches for one medicine
 */
router.get(
  "/medicine/:medicineId",
  authMiddleware,
  getBatchesByMedicine
);

/**
 * STOCK IN
 */
router.post(
  "/stock-in",
  authMiddleware,
  roleMiddleware("PHARMACIST", "ADMIN"),
  stockIn
);

/**
 * STOCK OUT
 */
router.post(
  "/stock-out",
  authMiddleware,
  roleMiddleware("STAFF", "PHARMACIST", "ADMIN"),
  stockOut
);

module.exports = router;
