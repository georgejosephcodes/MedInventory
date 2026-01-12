const mongoose = require("mongoose");
const Batch = require("../models/Batch.model");
const Medicine = require("../models/Medicine.model");
const StockLog = require("../models/StockLog.model");

/**
 * =========================
 * STOCK IN (TRANSACTION)
 * =========================
 * - PHARMACIST only
 * - Add new batch OR increase quantity
 * - Fully audited
 */
const stockIn = async (req, res) => {
  try {
    const {
      medicineId,
      batchNumber,
      expiryDate,
      quantity,
      supplier,
    } = req.body;

    // 1️⃣ Validation
    if (!medicineId || !batchNumber || !expiryDate || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({ message: "Invalid medicineId" });
    }

    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
    }

    // 2️⃣ Check medicine
    const medicine = await Medicine.findById(medicineId);

    if (!medicine || !medicine.isActive) {
      return res.status(404).json({
        message: "Medicine not found or inactive",
      });
    }

    // 3️⃣ Find or create batch
    let batch = await Batch.findOne({ medicineId, batchNumber });

    if (batch) {
      batch.quantity += quantity;
      batch.updatedBy = req.user._id;
      await batch.save();
    } else {
      batch = await Batch.create({
        medicineId,
        batchNumber,
        expiryDate,
        quantity,
        supplier,
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });
    }

    // 4️⃣ Audit log (non-transactional)
    await StockLog.create({
      medicineId,
      batchId: batch._id,
      action: "IN",
      quantity,
      performedBy: req.user._id,
      note: "Stock added",
    });

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      data: batch,
    });
  } catch (err) {
    console.error("STOCK IN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Stock in failed",
      error: err.message,
    });
  }
};

/**
 * =========================
 * STOCK OUT (FEFO – NO TRANSACTIONS)
 * =========================
 * - STAFF / PHARMACIST
 * - Earliest-expiry-first
 * - Fully audited
 */
const stockOut = async (req, res) => {
  try {
    const { medicineId, quantity, note } = req.body;

    // 1️⃣ Validation
    if (!medicineId || !quantity) {
      return res.status(400).json({
        message: "medicineId and quantity required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({
        message: "Invalid medicineId",
      });
    }

    // 2️⃣ Check medicine
    const medicine = await Medicine.findById(medicineId);

    if (!medicine || !medicine.isActive) {
      return res.status(404).json({
        message: "Medicine not found or inactive",
      });
    }

    // 3️⃣ Fetch FEFO batches (non-expired, positive stock)
    const today = new Date();

    const batches = await Batch.find({
      medicineId,
      isActive: true,
      expiryDate: { $gt: today },
      quantity: { $gt: 0 },
    }).sort({ expiryDate: 1 });

    if (!batches.length) {
      return res.status(400).json({
        message: "No usable stock available",
      });
    }

    // 4️⃣ Check total availability
    const totalAvailable = batches.reduce(
      (sum, b) => sum + b.quantity,
      0
    );

    if (quantity > totalAvailable) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: totalAvailable,
      });
    }

    // 5️⃣ FEFO deduction
    let remaining = quantity;
    const deductions = [];

    for (const batch of batches) {
      if (remaining <= 0) break;

      const deduct = Math.min(batch.quantity, remaining);

      batch.quantity -= deduct;
      batch.updatedBy = req.user._id;
      await batch.save();

      remaining -= deduct;

      deductions.push({
        batchId: batch._id,
        deducted: deduct,
      });

      // Audit log per batch
      await StockLog.create({
        medicineId,
        batchId: batch._id,
        action: "OUT",
        quantity: deduct,
        performedBy: req.user._id,
        note: note || "Stock issued",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock issued successfully",
      requested: quantity,
      deductions,
    });
  } catch (err) {
    console.error("STOCK OUT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Stock out failed",
      error: err.message,
    });
  }
};


/**
 * =========================
 * GET BATCHES BY MEDICINE
 * =========================
 */
const getBatchesByMedicine = async (req, res) => {
  try {
    const { medicineId } = req.query;

    if (!medicineId) {
      return res.status(400).json({ message: "medicineId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({ message: "Invalid medicineId" });
    }

    const today = new Date();
    const batches = await Batch.find({
      medicineId,
      isActive: true,
      expiryDate: { $gt: today },
      quantity: { $gt: 0 },
    })
      .sort({ expiryDate: 1 })
      .populate("medicineId", "name");

    res.status(200).json(batches);
  } catch (err) {
    console.error("GET BATCHES ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch batches",
      error: err.message,
    });
  }
};

module.exports = {
  stockIn,
  stockOut,
  getBatchesByMedicine,
};
