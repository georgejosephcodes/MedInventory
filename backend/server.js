require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const createAdminIfNotExists = require("./utils/createAdmin");
const startExpireStockJob = require("./jobs/expireStock.job");
const startInventoryAlertJob = require("./jobs/inventoryAlert.job");
const redis = require("./config/redis");

const PORT = process.env.PORT || 8000;
let server;

(async () => {
  try {
    await connectDB();
    await createAdminIfNotExists();

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    startExpireStockJob();
    startInventoryAlertJob();
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
})();

async function gracefulShutdown(signal) {
  console.log(`Shutting down... (${signal})`);

  try {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }

    await redis.quit();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
