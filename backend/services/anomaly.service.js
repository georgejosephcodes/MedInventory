const axios = require("axios");
const StockLog = require("../models/StockLog.model");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

const runAnomalyDetection = async () => {
  const logs = await StockLog.find({ action: "OUT" })
    .select("_id quantity medicineId")
    .lean();

  if (logs.length < 10) {
    console.log("Not enough data for anomaly detection");
    return;
  }

  const payload = logs.map((log) => ({
    id: log._id.toString(),
    quantity: log.quantity,
    medicineId: log.medicineId.toString(),
  }));

  const response = await axios.post(`${ML_SERVICE_URL}/detect`, {
    logs: payload,
  });

  const { anomalousIds } = response.data;

  if (!anomalousIds.length) {
    console.log("No anomalies detected");
    return;
  }

  await StockLog.updateMany({ action: "OUT" }, { isAnomaly: false });

  await StockLog.updateMany(
    { _id: { $in: anomalousIds } },
    { isAnomaly: true }
  );

  console.log(`Anomaly detection done. Flagged: ${anomalousIds.length} logs`);
};

module.exports = { runAnomalyDetection };