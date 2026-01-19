const Medicine = require("../models/Medicine.model");
const User = require("../models/User.model");
const Batch = require("../models/Batch.model");
const StockLog = require("../models/StockLog.model");
const cacheService = require("../services/cacheService");

/**
 * GET /api/dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;

    // cache per role 
    const cacheKey = `dashboard:${user.role}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    let stats = {};

    if (user.role === "ADMIN") {
      const [totalMedicines, totalUsers, totalBatches, recentLogs] =
        await Promise.all([
          Medicine.countDocuments({ isActive: true }),
          User.countDocuments({ isActive: true }),
          Batch.countDocuments({ isActive: true }),
          StockLog.find()
            .populate("medicineId", "name")
            .populate("performedBy", "name role")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        ]);

      stats = { totalMedicines, totalUsers, totalBatches, recentLogs };
    } else if (user.role === "PHARMACIST") {
      const [totalMedicines, totalBatches, recentLogs] = await Promise.all([
        Medicine.countDocuments({ isActive: true }),
        Batch.countDocuments({ isActive: true }),
        StockLog.find()
          .populate("medicineId", "name")
          .populate("performedBy", "name role")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

      stats = { totalMedicines, totalBatches, recentLogs };
    } else if (user.role === "STAFF") {
      const [totalMedicines, recentLogs] = await Promise.all([
        Medicine.countDocuments({ isActive: true }),
        StockLog.find()
          .populate("medicineId", "name")
          .populate("performedBy", "name role")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

      stats = { totalMedicines, recentLogs };
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
    }

    const response = {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      stats,
    };

    // short TTL 
    await cacheService.set(cacheKey, response, 30);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

module.exports = {
  getDashboardData,
};
