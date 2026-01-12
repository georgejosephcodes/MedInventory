const express = require("express");
const router = express.Router();
const {
  renderLogin,
  renderDashboard,
  renderMedicines,
  renderStockIn,
  renderStockOut,
  renderAuditLogs,
  renderReports,
  renderUsers,
  renderForgotPassword,
  renderResetPassword,
  handleLogout,
} = require("../controllers/view.controller");

// Public routes
router.get("/login", renderLogin);
router.get("/forgot-password", renderForgotPassword);
router.get("/reset-password/:token", renderResetPassword);
router.get("/logout", handleLogout);

// Protected routes (auth handled client-side)
router.get("/", renderDashboard);
router.get("/dashboard", renderDashboard);
router.get("/medicines", renderMedicines);
router.get("/stock-in", renderStockIn);
router.get("/stock-out", renderStockOut);
router.get("/audit-logs", renderAuditLogs);
router.get("/reports", renderReports);
router.get("/users", renderUsers);

module.exports = router;
