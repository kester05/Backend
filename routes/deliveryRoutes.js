const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const { authenticate, authorize } = require("../middleware/auth");

// Assign delivery to driver (admin only)
router.post("/", authenticate, authorize(["admin"]), deliveryController.assignDelivery);

// Get delivery details
router.get("/:id", authenticate, deliveryController.getDelivery);

// Update delivery status (driver only)
router.put("/:id/status", authenticate, authorize(["driver"]), deliveryController.updateDeliveryStatus);

// Get delivery tracking (real-time location)
router.get("/:id/tracking", authenticate, deliveryController.getDeliveryTracking);

// Generate OTP (staff only)
router.post("/:id/otp/generate", authenticate, authorize(["staff"]), deliveryController.generateOTP);

// Verify OTP (driver only)
router.post("/:id/otp/verify", authenticate, authorize(["driver"]), deliveryController.verifyOTP);

module.exports = router;
