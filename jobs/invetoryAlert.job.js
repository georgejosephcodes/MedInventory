const cron = require("node-cron");
const User = require("../models/User.model");
const { getInventoryAlerts } = require("../services/inventoryAlert.service");
const sendMail = require("../utils/mailer");
const { inventoryAlertTemplate } = require("../utils/emailTemplates");

const startInventoryAlertJob = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("Running inventory alert job");

      const admins = await User.find({ role: "ADMIN", isActive: true });

      const { expiringBatches, lowStockMedicines } =
        await getInventoryAlerts();

      if (!expiringBatches.length && !lowStockMedicines.length) return;

      const adminEmails = admins.map((a) => a.email);

      const html = inventoryAlertTemplate({
        expiringBatches,
        lowStockMedicines,
      });

      await sendMail(adminEmails, "MedInventory Alerts", html);
      console.log("Inventory alert emails sent");
    } catch (err) {
      console.error("Inventory alert job failed:", err.message);
    }
  });
};

module.exports = startInventoryAlertJob;
