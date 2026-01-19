const mongoose = require("mongoose");
const Batch = require("../models/Batch.model");
const Medicine = require("../models/Medicine.model");
const StockLog = require("../models/StockLog.model");
const redisLockService = require("../services/redisLockService");
const cacheService = require("../services/cacheService");

/**
 * =========================
 * STOCK IN
 * =========================
 */
const stockIn = async (req, res) => {
  const {
    medicineId,
    batchNumber,
    expiryDate,
    quantity,
    supplier,
    unitPrice,
  } = req.body;

  const lockKey = `lock:medicine:${medicineId}`;

  try {
    return await redisLockService.withLock(lockKey, 10000, async () => {
      /* =========================
         VALIDATION
      ========================= */
      if (
        !medicineId ||
        !batchNumber ||
        !expiryDate ||
        !quantity ||
        !supplier ||
        !unitPrice
      ) {
        return res.status(400).json({
          message: "All stock-in fields are required",
        });
      }

      if (quantity <= 0 || unitPrice <= 0) {
        return res.status(400).json({
          message: "Quantity and unitPrice must be greater than 0",
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

      const medicine = await Medicine.findById(medicineId);
      if (!medicine || !medicine.isActive) {
        return res.status(404).json({
          message: "Medicine not found or inactive",
        });
      }

      /* =========================
         BATCH UPSERT
      ========================= */
      let batch = await Batch.findOne({
        medicineId,
        batchNumber,
        isActive: true,
      });

      if (batch) {
        if (batch.unitPrice !== unitPrice) {
          return res.status(400).json({
            message:
              "Unit price mismatch for existing batch. Create a new batch.",
          });
        }

        batch.quantity += quantity;
        batch.updatedBy = req.user._id;
        await batch.save();
      } else {
        batch = await Batch.create({
          medicineId,
          batchNumber,
          expiryDate,
          quantity,
          unitPrice,
          supplier,
          createdBy: req.user._id,
          updatedBy: req.user._id,
        });
      }

      /* =========================
         AUDIT LOG
      ========================= */
      await StockLog.create({
        medicineId,
        batchId: batch._id,
        action: "IN",
        quantity,
        unitPrice,
        totalCost: unitPrice * quantity,
        performedBy: req.user._id,
        note: supplier,
      });

      // invalidate caches
      await cacheService.del("medicines:active");
      await cacheService.delPattern(`batches:${medicineId}`);
      await cacheService.del("batches:all");
      await cacheService.del(`dashboard:${req.user.role}`);

      return res.status(201).json({
        success: true,
        message: "Stock added successfully",
        data: batch,
      });
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
 * STOCK OUT (FEFO)
 * =========================
 */
const stockOut = async (req, res) => {
  const { medicineId, quantity, note } = req.body;
  const lockKey = `lock:medicine:${medicineId}`;

  try {
    return await redisLockService.withLock(lockKey, 10000, async () => {
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

      const medicine = await Medicine.findById(medicineId);
      if (!medicine || !medicine.isActive) {
        return res.status(404).json({
          message: "Medicine not found or inactive",
        });
      }

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
          unitPrice: batch.unitPrice,
          totalCost: batch.unitPrice * deduct,
        });

        await StockLog.create({
          medicineId,
          batchId: batch._id,
          action: "OUT",
          quantity: deduct,
          unitPrice: batch.unitPrice,
          totalCost: batch.unitPrice * deduct,
          performedBy: req.user._id,
          note: note || "Stock issued",
        });
      }

      // invalidate caches
      await cacheService.del("medicines:active");
      await cacheService.delPattern(`batches:${medicineId}`);
      await cacheService.del("batches:all");
      await cacheService.del(`dashboard:${req.user.role}`);

      return res.status(200).json({
        success: true,
        message: "Stock issued successfully",
        requested: quantity,
        deductions,
      });
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
 * GET ALL ACTIVE BATCHES
 * =========================
 */
const getAllBatches = async (req, res) => {
  try {
    const cacheKey = "batches:all";

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, batches: cached });
    }

    const batches = await Batch.find({
      isActive: true,
      quantity: { $gt: 0 },
    })
      .populate("medicineId", "name category minStock")
      .sort({ expiryDate: 1 })
      .lean();

    await cacheService.set(cacheKey, batches, 60);

    res.status(200).json({
      success: true,
      batches,
    });
  } catch (err) {
    console.error("GET ALL BATCHES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
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
    const { medicineId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({
        message: "Invalid medicineId",
      });
    }

    const cacheKey = `batches:${medicineId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, batches: cached });
    }

    const today = new Date();

    const batches = await Batch.find({
      medicineId,
      isActive: true,
      expiryDate: { $gt: today },
      quantity: { $gt: 0 },
    })
      .sort({ expiryDate: 1 })
      .populate("medicineId", "name")
      .lean();

    await cacheService.set(cacheKey, batches, 60);

    res.status(200).json({
      success: true,
      batches,
    });
  } catch (err) {
    console.error("GET BATCHES BY MEDICINE ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch batches",
    });
  }
};

module.exports = {
  stockIn,
  stockOut,
  getBatchesByMedicine,
  getAllBatches,
};
