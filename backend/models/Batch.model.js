const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

batchSchema.index(
  { medicineId: 1, batchNumber: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

batchSchema.index({ expiryDate: 1, quantity: 1, isActive: 1 });

module.exports = mongoose.model("Batch", batchSchema);
