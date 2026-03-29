const cron = require("node-cron");
const { runAnomalyDetection } = require("../services/anomaly.service");

let started = false;

const startAnomalyDetectionJob = () => {
  if (started) return;
  started = true;

  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running anomaly detection job");
      await runAnomalyDetection();
    } catch (err) {
      console.error("Anomaly detection job failed:", err);
    }
  });
};

module.exports = startAnomalyDetectionJob;