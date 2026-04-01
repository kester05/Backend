const Driver = require("../models/Driver");
const User = require("../models/User");
const Delivery = require("../models/Delivery");

// Register as Driver - Create driver profile for user
exports.registerDriver = async (req, res) => {
  try {
    const { licenseNumber, licenseExpiry, vehicleNumber, vehicleType } = req.body;
    const userId = req.user.userId;

    // Check if driver profile already exists for this user
    const existingDriver = await Driver.findOne({ userId });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver profile already exists for this user" });
    }

    // Check if license number is unique
    const licenseExists = await Driver.findOne({ licenseNumber });
    if (licenseExists) {
      return res.status(400).json({ message: "License number already registered" });
    }

    const driver = new Driver({
      userId,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      vehicleNumber,
      vehicleType,
    });

    await driver.save();

    res.status(201).json({
      message: "Driver profile registered successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get driver profile
exports.getDriverProfile = async (req, res) => {
  try {
    const driverId = req.params.id;

    const driver = await Driver.findById(driverId)
      .populate("userId", "name email")
      .exec();

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available drivers (for admin to assign deliveries)
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: "available" })
      .populate("userId", "name email")
      .exec();

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update driver location (GPS tracking)
exports.updateDriverLocation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { latitude, longitude } = req.body;

    const driver = await Driver.findOne({ userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    driver.currentLatitude = latitude;
    driver.currentLongitude = longitude;
    await driver.save();

    res.json({
      message: "Location updated successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get driver's assigned deliveries
exports.getDriverDeliveries = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find driver by userId
    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    // Get all deliveries for this driver (excluding completed ones)
    const deliveries = await Delivery.find({
      driverId: driver._id,
      status: { $in: ["pending", "accepted", "in-transit"] },
    })
      .populate("itemId", "name description unit quantity")
      .populate("storeLocationId", "storeName address latitude longitude phoneNumber")
      .populate("staffId", "name email")
      .exec();

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get driver's delivery history (completed deliveries)
exports.getDeliveryHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find driver by userId
    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    // Get completed deliveries
    const deliveries = await Delivery.find({
      driverId: driver._id,
      status: "completed",
    })
      .populate("itemId", "name description unit")
      .populate("storeLocationId", "storeName address")
      .populate("staffId", "name")
      .sort({ completedAt: -1 })
      .exec();

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Verify this driver owns the delivery
    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.driverId.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: This is not your delivery" });
    }

    delivery.status = status;

    if (status === "in-transit") {
      delivery.startedAt = new Date();
      // Capture driver's start location
      delivery.driverStartLat = driver.currentLatitude;
      delivery.driverStartLon = driver.currentLongitude;
    }

    await delivery.save();

    res.json({
      message: `Delivery status updated to ${status}`,
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current delivery status for tracking
exports.getDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate("driverId")
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
