const StockLog = require("../models/StockLog.model");
const mongoose = require("mongoose");

const getStockLogs = async (req, res) => {
  try {
    const { action, medicineId, from, to, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action) query.action = action;

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
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      StockLog.find(query)
        .populate("medicineId", "name category")
        .populate("performedBy", "name role")
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};

module.exports = { getStockLogs };
