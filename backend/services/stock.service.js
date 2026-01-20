const Batch = require("../models/Batch.model");
const StockLog = require("../models/StockLog.model");

const expireBatches = async (performedBy) => {
  if (!performedBy) {
    throw new Error("SYSTEM_USER_ID not configured");
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const expiredBatches = await Batch.find({
    expiryDate: { $lte: today },
    quantity: { $gt: 0 },
    isActive: true,
  }).lean();

  let totalExpired = 0;
  let count = 0;

  for (const batch of expiredBatches) {
    const res = await Batch.updateOne(
      { _id: batch._id, quantity: { $gt: 0 } },
      {
        $set: {
          quantity: 0,
          isActive: false,
          updatedBy: performedBy,
        },
      }
    );

    if (res.modifiedCount === 0) continue;

    const expiredQty = batch.quantity;
    totalExpired += expiredQty;
    count++;

    await StockLog.create({
      medicineId: batch.medicineId,
      batchId: batch._id,
      action: "EXPIRED",
      quantity: expiredQty,
      unitPrice: batch.unitPrice,
      totalCost: expiredQty * batch.unitPrice,
      performedBy,
      note: "Auto expired by cron",
    });
  }

  return { count, totalExpired };
};

module.exports = { expireBatches };
