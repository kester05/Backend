const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  requestedQuantity: {
    type: Number,
    required: true,
  },
  approvedQuantity: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "fulfilled"],
    default: "pending",
  },
  reason: {
    type: String,
  },
  adminComment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

module.exports = mongoose.model("Request", requestSchema);
