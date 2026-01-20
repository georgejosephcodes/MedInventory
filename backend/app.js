const express = require("express");
const app = express();
const cors = require('cors');
// Routes
const batchRoutes = require("./routes/batch.routes");
const authRoutes = require("./routes/auth.routes");
const medicineRoutes = require("./routes/medicine.routes");
const auditRoutes = require("./routes/audit.routes");
const reportRoutes = require("./routes/report.routes");
const adminRoutes = require("./routes/admin.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://med-inventory.vercel.app'
  ],
  credentials: true,
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
// 404 fallback 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
 