const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { authenticate, authorize } = require("../middleware/auth");

// Register as driver
router.post("/register", authenticate, driverController.registerDriver);

// Get available drivers (admin only)
router.get("/available", authenticate, authorize(["admin"]), driverController.getAvailableDrivers);

// Get driver profile
router.get("/:id", authenticate, driverController.getDriverProfile);

// Update driver location (driver updates own location)
router.put("/location", authenticate, authorize(["driver"]), driverController.updateDriverLocation);

// Get driver's assigned deliveries (driver only)
router.get("/deliveries/assigned", authenticate, authorize(["driver"]), driverController.getDriverDeliveries);

// Get driver's delivery history (driver only)
router.get("/history", authenticate, authorize(["driver"]), driverController.getDeliveryHistory);

// Update delivery status (driver only)
router.put("/deliveries/:deliveryId/status", authenticate, authorize(["driver"]), driverController.updateDeliveryStatus);

// Get delivery status for tracking
router.get("/deliveries/:deliveryId/status", authenticate, driverController.getDeliveryStatus);

module.exports = router;
