const StockLog = require("../models/StockLog.model");
const Batch = require("../models/Batch.model");
const Medicine = require("../models/Medicine.model");

/* =========================
   DATE UTILS
========================= */
const getDateRange = (from, to) => {
  const now = new Date();

  if (!from || !to) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  }

  const start = new Date(from);
  let end = new Date(to);

  const isToday =
    end.toDateString() === now.toDateString();

  if (isToday) {
    end = now;
  } else {
    // otherwise include full selected day
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

/* =========================
   1️⃣ MONTHLY / RANGE USAGE
========================= */
const monthlyUsageReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to);

    const data = await StockLog.aggregate([
      {
        $match: {
          action: "OUT",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$medicineId",
          totalUsed: { $sum: "$quantity" },
          totalCost: {
            $sum: { $multiply: ["$quantity", "$unitPrice"] },
          },
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
          medicine: "$medicine.name",
          category: "$medicine.category",
          totalUsed: 1,
          totalCost: 1,
        },
      },
      { $sort: { totalUsed: 1 } },
    ]);

    res.status(200).json({
      from: start,
      to: end,
      data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate usage report",
      error: err.message,
    });
  }
};

/* =========================
   2️⃣ TOP CONSUMED
========================= */
const topConsumedMedicines = async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;
    const { start, end } = getDateRange(from, to);

    const data = await StockLog.aggregate([
      {
        $match: {
          action: "OUT",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$medicineId",
          totalUsed: { $sum: "$quantity" },
          totalCost: {
            $sum: { $multiply: ["$quantity", "$unitPrice"] },
          },
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
          name: "$medicine.name",
          category: "$medicine.category",
          totalUsed: 1,
          totalCost: 1,
        },
      },
      { $sort: { totalUsed: -1 } },
      { $limit: Number(limit) },
    ]);

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch top consumed medicines",
      error: err.message,
    });
  }
};

/* =========================
   3️⃣ EXPIRED / WASTAGE
========================= */
const expiredWastageReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to);

    const data = await StockLog.aggregate([
      {
        $match: {
          action: "EXPIRED",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$medicineId",
          wastedQty: { $sum: "$quantity" },
          totalCost: {
            $sum: { $multiply: ["$quantity", "$unitPrice"] },
          },
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
          name: "$medicine.name",
          category: "$medicine.category",
          wastedQty: 1,
          totalCost: 1,
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
