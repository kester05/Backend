const mongoose = require("mongoose");

const storeLocationSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  createdByStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
  phoneNumber: {
    type: String,
  },
  contactPerson: {
    type: String,
  },
  editedByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  editHistory: [
    {
      editedAt: Date,
      editedBy: mongoose.Schema.Types.ObjectId,
      changes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StoreLocation", storeLocationSchema);
