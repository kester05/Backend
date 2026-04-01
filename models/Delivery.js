const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
    unique: true,
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  approvedQuantity: {
    type: Number,
    required: true,
  },
  deliveredQuantity: {
    type: Number,
    default: null,
  },
  storeLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreLocation",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "in-transit", "completed", "failed"],
    default: "pending",
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },

  // Location tracking
  driverStartLat: {
    type: Number,
    default: null,
  },
  driverStartLon: {
    type: Number,
    default: null,
  },
  driverEndLat: {
    type: Number,
    default: null,
  },
  driverEndLon: {
    type: Number,
    default: null,
  },
  routePolyline: {
    type: String,
    default: null,
  },

  // OTP verification
  generatedOTP: {
    type: String,
    default: null,
  },
  otpGeneratedAt: {
    type: Date,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  otpAttempts: {
    type: Number,
    default: 0,
  },
  driverEnteredOTP: {
    type: String,
    default: null,
  },
  otpVerifiedAt: {
    type: Date,
    default: null,
  },

  // Proof of delivery
  photoProof: {
    type: String,
    default: null,
  },
  remarks: {
    type: String,
    default: null,
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

module.exports = mongoose.model("Delivery", deliverySchema);
