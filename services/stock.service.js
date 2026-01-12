const Batch = require("../models/Batch.model");
const StockLog = require("../models/StockLog.model");

const expireBatches = async (performedBy) => {
  if (!performedBy) {
    throw new Error("SYSTEM_USER_ID not configured");
  }

  const today = new Date();
  const expiredBatches = await Batch.find({
    expiryDate: { $lte: today },
    quantity: { $gt: 0 },
    isActive: true,
  });

  let totalExpired = 0;

  for (const batch of expiredBatches) {
    const expiredQty = batch.quantity;

    batch.quantity = 0;
    batch.updatedBy = performedBy;
    await batch.save();

    totalExpired += expiredQty;

    await StockLog.create({
      medicineId: batch.medicineId,
      batchId: batch._id,
      action: "EXPIRED",
      quantity: expiredQty,
      performedBy,
      note: "Auto expired by cron",
    });
  }

  return {
    count: expiredBatches.length,
    totalExpired,
  };
};

module.exports = { expireBatches };
