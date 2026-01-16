const cron = require("node-cron");
const { expireBatches } = require("../services/stock.service");

const startExpireStockJob = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID;

      if (!SYSTEM_USER_ID) {
        console.error("SYSTEM_USER_ID missing. Expire job skipped.");
        return;
      }

      console.log("Running expire stock job");
      await expireBatches(SYSTEM_USER_ID);
      console.log("Expire stock job completed");
    } catch (err) {
      console.error("Expire stock job failed:", err.message);
    }
  });
};

module.exports = startExpireStockJob;
