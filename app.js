const express = require("express");
const app = express();

// Routes
const batchRoutes = require("./routes/batch.routes");
const authRoutes = require("./routes/auth.routes");
const medicineRoutes = require("./routes/medicine.routes");
const auditRoutes = require("./routes/audit.routes");
const reportRoutes = require("./routes/report.routes");
const adminRoutes = require("./routes/admin.routes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// 404 fallback 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
 