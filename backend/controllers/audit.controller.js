const mongoose = require("mongoose");
const StockLog = require("../models/StockLog.model");
const cacheService = require("../services/cacheService");

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

    /* =========================
       CACHE KEY (query-specific)
    ========================= */
    const cacheKey = `stockLogs:${JSON.stringify({
      action,
      medicineId,
      from,
      to,
      page,
      limit,
    })}`;

    // 1. Try cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

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
        .limit(Number(limit))
        .lean(),

      StockLog.countDocuments(query),
    ]);

    const response = {
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    };

    // 2. Cache result (short TTL – logs change often)
    await cacheService.set(cacheKey, response, 30);

    res.status(200).json(response);
  } catch (err) {
    console.error("AUDIT LOG ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};

module.exports = { getStockLogs };
