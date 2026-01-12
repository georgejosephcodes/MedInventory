const Medicine = require("../models/Medicine.model");
const User = require("../models/User.model");
const Batch = require("../models/Batch.model");
const StockLog = require("../models/StockLog.model");

/**
 * GET /api/dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
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
            .limit(10),
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
          .limit(10),
      ]);

      stats = { totalMedicines, totalBatches, recentLogs };
    } else if (user.role === "STAFF") {
      const [totalMedicines, recentLogs] = await Promise.all([
        Medicine.countDocuments({ isActive: true }),
        StockLog.find()
          .populate("medicineId", "name")
          .populate("performedBy", "name role")
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

      stats = { totalMedicines, recentLogs };
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      stats,
    });
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
