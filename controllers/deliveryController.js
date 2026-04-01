const Delivery = require("../models/Delivery");
const Request = require("../models/Request");
const Item = require("../models/Item");
const Driver = require("../models/Driver");
const Notification = require("../models/Notification");

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Assign delivery to driver (Admin - after approving request)
exports.assignDelivery = async (req, res) => {
  try {
    const { requestId, driverId, storeLocationId } = req.body;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "approved") {
      return res.status(400).json({ message: "Request must be approved first" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const deliveryId = `DLV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const delivery = new Delivery({
      deliveryId,
      requestId,
      staffId: request.staffId,
      driverId,
      itemId: request.itemId,
      approvedQuantity: request.approvedQuantity,
      storeLocationId,
      status: "pending",
    });

    await delivery.save();

    request.assignedDriverId = driverId;
    request.assignedAt = new Date();
    request.deliveryId = delivery._id;
    await request.save();

    driver.status = "on-delivery";
    await driver.save();

    res.status(201).json({ message: "Delivery assigned successfully", delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery by ID
exports.getDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id)
      .populate("itemId")
      .populate("storeLocationId")
      .populate("staffId", "name email")
      .populate("driverId")
      .exec();

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const driver = await Driver.findById(delivery.driverId);
    if (driver.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    delivery.status = status;
    if (status === "in-transit") {
      delivery.startedAt = new Date();
      delivery.driverStartLat = driver.currentLatitude;
      delivery.driverStartLon = driver.currentLongitude;
    }

    delivery.updatedAt = new Date();
    await delivery.save();

    res.json({ message: `Status updated to ${status}`, delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery tracking (real-time location)
exports.getDeliveryTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id)
      .populate("driverId", "currentLatitude currentLongitude vehicleNumber vehicleType")
      .exec();

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json({
      deliveryId: delivery.deliveryId,
      status: delivery.status,
      driverLocation: {
        latitude: delivery.driverId.currentLatitude,
        longitude: delivery.driverId.currentLongitude,
      },
      updatedAt: delivery.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate OTP
exports.generateOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.userId;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const otpCode = generateOTP();
    delivery.generatedOTP = otpCode;
    delivery.otpGeneratedAt = new Date();
    delivery.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    delivery.otpAttempts = 0;
    await delivery.save();

    res.json({ message: "OTP generated", otp: otpCode, expiresAt: delivery.otpExpiresAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const userId = req.user.userId;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const driver = await Driver.findById(delivery.driverId);
    if (driver.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!delivery.otpExpiresAt || new Date() > delivery.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (delivery.otpAttempts >= 3) {
      return res.status(400).json({ message: "Max attempts exceeded" });
    }

    if (delivery.generatedOTP !== otp) {
      delivery.otpAttempts += 1;
      await delivery.save();
      return res.status(400).json({
        message: "Invalid OTP",
        attemptsRemaining: 3 - delivery.otpAttempts
      });
    }

    // OTP correct - Complete delivery
    delivery.status = "completed";
    delivery.deliveredQuantity = delivery.approvedQuantity;
    delivery.driverEnteredOTP = otp;
    delivery.otpVerifiedAt = new Date();
    delivery.completedAt = new Date();
    await delivery.save();

    // Update request
    const request = await Request.findById(delivery.requestId);
    request.status = "fulfilled";
    await request.save();

    // Deduct from inventory
    const item = await Item.findById(delivery.itemId);
    item.quantity -= delivery.deliveredQuantity;
    await item.save();

    // Update driver
    driver.status = "available";
    driver.totalDeliveries += 1;
    await driver.save();

    res.json({ message: "OTP verified. Delivery completed.", delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
