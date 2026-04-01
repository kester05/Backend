const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  licenseExpiry: {
    type: Date,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ["Van", "Truck", "Bike", "Car", "Other"],
    default: "Van",
  },
  currentLatitude: {
    type: Number,
    default: null,
  },
  currentLongitude: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ["available", "on-delivery", "offline"],
    default: "available",
  },
  totalDeliveries: {
    type: Number,
    default: 0,
  },
  successRate: {
    type: Number,
    default: 100, // percentage (0-100)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Driver", driverSchema);
