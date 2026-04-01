const mongoose = require("mongoose");

const godownLocationSchema = new mongoose.Schema({
  godownName: {
    type: String,
    required: true,
  },
  createdByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
  },
  capacity: {
    type: Number,
    default: 0,
  },
  currentLoad: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model("GodownLocation", godownLocationSchema);
