const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");

// Get user's notifications
router.get("/", authenticate, notificationController.getNotifications);

// Mark notification as read
router.put("/:id/read", authenticate, notificationController.markAsRead);

// Delete notification
router.delete("/:id", authenticate, notificationController.deleteNotification);

module.exports = router;
