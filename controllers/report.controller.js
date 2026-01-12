const StockLog = require("../models/StockLog.model");
const mongoose = require("mongoose");

/**
 * =========================
 * 1️⃣ MONTHLY USAGE REPORT
 * =========================
 * ?year=2026
 */
const monthlyUsageReport = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const data = await StockLog.aggregate([
      {
        $match: {
          action: "OUT",
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            medicineId: "$medicineId",
          },
          totalUsed: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "_id.medicineId",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          medicine: "$medicine.name",
          totalUsed: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.status(200).json({ year, data });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate monthly usage report",
      error: err.message,
    });
  }
};

/**
 * =========================
 * 2️⃣ TOP CONSUMED MEDICINES
 * =========================
 * ?limit=5
 */
const topConsumedMedicines = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const data = await StockLog.aggregate([
      { $match: { action: "OUT" } },
      {
        $group: {
          _id: "$medicineId",
          totalUsed: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $project: {
          _id: 0,
          medicineId: "$medicine._id",
          name: "$medicine.name",
          category: "$medicine.category",
          totalUsed: 1,
        },
      },
      { $sort: { totalUsed: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch top consumed medicines",
      error: err.message,
    });
  }
};

/**
 * =========================
 * 3️⃣ EXPIRED WASTAGE REPORT
 * =========================
 */
const expiredWastageReport = async (req, res) => {
  try {
    const data = await StockLog.aggregate([
      { $match: { action: "EXPIRED" } },
      {
        $group: {
          _id: "$medicineId",
          wastedQty: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $project: {
          _id: 0,
          medicineId: "$medicine._id",
          name: "$medicine.name",
          category: "$medicine.category",
          wastedQty: 1,
        },
      },
      { $sort: { wastedQty: -1 } },
    ]);

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate expiry wastage report",
      error: err.message,
    });
  }
};

module.exports = {
  monthlyUsageReport,
  topConsumedMedicines,
  expiredWastageReport,
};
