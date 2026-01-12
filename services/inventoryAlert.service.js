const Batch = require("../models/Batch.model");

const getInventoryAlerts = async () => {
  try {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    // 🔔 EXPIRING SOON
    const expiringBatches = await Batch.aggregate([
      {
        $match: {
          isActive: true,
          quantity: { $gt: 0 },
          expiryDate: { $gt: today, $lte: next30Days },
        },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "medicineId",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      { $match: { "medicine.isActive": true } },
      {
        $project: {
          batchNumber: 1,
          expiryDate: 1,
          quantity: 1,
          medicineId: "$medicine._id",
          medicineName: "$medicine.name",
          category: "$medicine.category",
        },
      },
      { $sort: { expiryDate: 1 } },
    ]);

    // 🔔 LOW STOCK
    const lowStockMedicines = await Batch.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$medicineId",
          totalQty: { $sum: "$quantity" },
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
        $match: {
          "medicine.isActive": true,
          $expr: { $lt: ["$totalQty", "$medicine.minStock"] },
        },
      },
      {
        $project: {
          medicineId: "$medicine._id",
          name: "$medicine.name",
          category: "$medicine.category",
          totalQty: 1,
          minStock: "$medicine.minStock",
        },
      },
      { $sort: { totalQty: 1 } },
    ]);

    return { expiringBatches, lowStockMedicines };
  } catch (err) {
    console.error("INVENTORY ALERT SERVICE ERROR:", err);
    return { expiringBatches: [], lowStockMedicines: [] };
  }
};

module.exports = { getInventoryAlerts };
