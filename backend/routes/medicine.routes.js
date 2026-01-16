const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  createMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicine.controller");

// ALL AUTHENTICATED USERS
router.get("/", authMiddleware, getMedicines);

// ADMIN ONLY
router.post("/", authMiddleware, roleMiddleware("ADMIN"), createMedicine);
router.patch("/:id", authMiddleware, roleMiddleware("ADMIN"), updateMedicine);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteMedicine);

module.exports = router;
