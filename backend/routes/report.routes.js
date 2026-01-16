const express = require("express");
const router = express.Router();
const dashboardKPIs = require("../controllers/report.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  monthlyUsageReport,
  topConsumedMedicines,
  expiredWastageReport,
} = require("../controllers/report.controller");

router.get(
  "/monthly-usage",
  authMiddleware,
  roleMiddleware("ADMIN"),
  monthlyUsageReport
);

router.get(
  "/top-consumed",
  authMiddleware,
  roleMiddleware("ADMIN"),
  topConsumedMedicines
);

router.get(
  "/expired-wastage",
  authMiddleware,
  roleMiddleware("ADMIN"),
  expiredWastageReport
);



module.exports = router;
