const Medicine = require("../models/Medicine.model");

/**
 * =====================
 * CREATE MEDICINE (ADMIN)
 * =====================
 */
const createMedicine = async (req, res) => {
  try {
    let { name, category, description, minStock } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category required",
      });
    }

    if (minStock !== undefined && minStock < 0) {
      return res.status(400).json({
        success: false,
        message: "minStock must be >= 0",
      });
    }

    name = name.trim().toLowerCase();

    const existing = await Medicine.findOne({ name });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Medicine already exists",
      });
    }

    const medicine = await Medicine.create({
      name,
      category,
      description,
      minStock,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: medicine,
    });
  } catch (err) {
    console.error("CREATE MEDICINE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create medicine",
    });
  }
};

/**
 * =====================
 * GET MEDICINES (ALL ROLES)
 * =====================
 */
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true }).sort("name");

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (err) {
    console.error("GET MEDICINES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
    });
  }
};

/**
 * =====================
 * UPDATE MEDICINE (ADMIN)
 * =====================
 */
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine || !medicine.isActive) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    if (req.body.minStock !== undefined && req.body.minStock < 0) {
      return res.status(400).json({
        success: false,
        message: "minStock must be >= 0",
      });
    }

    if (req.body.name) {
      const newName = req.body.name.trim().toLowerCase();

      if (newName !== medicine.name) {
        const exists = await Medicine.findOne({
          name: newName,
          _id: { $ne: medicine._id },
        });

        if (exists) {
          return res.status(409).json({
            success: false,
            message: "Medicine with this name already exists",
          });
        }
      }

      medicine.name = newName;
    }

    const allowedUpdates = ["category", "description", "minStock"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        medicine[field] = req.body[field];
      }
    });

    medicine.updatedBy = req.user._id;
    await medicine.save();

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (err) {
    console.error("UPDATE MEDICINE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update medicine",
    });
  }
};

/**
 * =====================
 * DELETE MEDICINE (ADMIN – SOFT DELETE)
 * =====================
 */
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine || !medicine.isActive) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    medicine.isActive = false;
    medicine.updatedBy = req.user._id;
    await medicine.save();

    res.status(200).json({
      success: true,
      message: "Medicine deactivated successfully",
    });
  } catch (err) {
    console.error("DELETE MEDICINE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete medicine",
    });
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
};
