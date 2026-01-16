require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const createAdminIfNotExists = require("./utils/createAdmin");
// const startExpireStockJob = require("./jobs/expireStock.job");
// const startInventoryAlertJob = require("./jobs/inventoryAlert.job");

const PORT = process.env.PORT || 8000;

(async () => {
  await connectDB();
  await createAdminIfNotExists();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // startExpireStockJob();
  // startInventoryAlertJob();
})();

