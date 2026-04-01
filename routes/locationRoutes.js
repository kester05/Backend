const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");
const { authenticate, authorize } = require("../middleware/auth");

// Store Locations
router.post("/stores", authenticate, authorize(["staff"]), locationController.createStoreLocation);
router.get("/stores", authenticate, locationController.getAllStoreLocations);
router.get("/stores/:id", authenticate, locationController.getStoreLocationById);
router.put("/stores/:id", authenticate, locationController.updateStoreLocation);
router.delete("/stores/:id", authenticate, locationController.deleteStoreLocation);

// Godown Locations
router.post("/godown", authenticate, authorize(["admin"]), locationController.createGodownLocation);
router.get("/godown", authenticate, locationController.getGodownLocation);
router.put("/godown", authenticate, authorize(["admin"]), locationController.updateGodownLocation);
router.put("/godown/load", authenticate, authorize(["admin"]), locationController.updateGodownLoad);

module.exports = router;
