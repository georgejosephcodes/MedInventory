const mongoose = require("mongoose");
const StockLog = require("../models/StockLog.model");

const getStockLogs = async (req, res) => {
  try {
    const {
      action,
      medicineId,
      from,
      to,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    /* =========================
       FILTERS
    ========================= */
    if (action) {
      query.action = action;
    }

    if (medicineId) {
      if (!mongoose.Types.ObjectId.isValid(medicineId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid medicineId",
        });
      }
      query.medicineId = medicineId;
    }

    if (from || to) {
      query.createdAt = {};

      if (from) {
        query.createdAt.$gte = new Date(from);
      }

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    /* =========================
       QUERY
    ========================= */
    const [logs, total] = await Promise.all([
      StockLog.find(query)
        .select(
          "medicineId batchId action quantity unitPrice totalCost performedBy note createdAt"
        )
        .populate("medicineId", "name category")
        .populate("batchId", "batchNumber expiryDate unitPrice")
        .populate("performedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      StockLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (err) {
    console.error("AUDIT LOG ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};

module.exports = { getStockLogs };
