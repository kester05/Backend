const StoreLocation = require("../models/StoreLocation");
const GodownLocation = require("../models/GodownLocation");

// ===== STORE LOCATION ENDPOINTS =====

// Create store location (Staff)
exports.createStoreLocation = async (req, res) => {
  try {
    const { storeName, latitude, longitude, address, phoneNumber, contactPerson } = req.body;
    const staffId = req.user.userId;

    const storeLocation = new StoreLocation({
      storeName,
      createdByStaffId: staffId,
      latitude,
      longitude,
      address,
      phoneNumber,
      contactPerson,
    });

    await storeLocation.save();

    res.status(201).json({
      message: "Store location created successfully",
      storeLocation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all store locations
exports.getAllStoreLocations = async (req, res) => {
  try {
    const stores = await StoreLocation.find()
      .populate("createdByStaffId", "name email")
      .populate("editedByAdminId", "name email")
      .exec();

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single store location
exports.getStoreLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await StoreLocation.findById(id)
      .populate("createdByStaffId", "name email")
      .populate("editedByAdminId", "name email")
      .exec();

    if (!store) {
      return res.status(404).json({ message: "Store location not found" });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update store location (Staff can edit their own, Admin can edit any)
exports.updateStoreLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeName, latitude, longitude, address, phoneNumber, contactPerson } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const store = await StoreLocation.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Store location not found" });
    }

    // Authorization check
    if (userRole !== "admin" && store.createdByStaffId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own stores" });
    }

    // Track edit history
    const oldValues = {
      storeName: store.storeName,
      latitude: store.latitude,
      longitude: store.longitude,
    };

    const changes = [];
    if (storeName && storeName !== store.storeName) {
      changes.push(`Store name changed from "${oldValues.storeName}" to "${storeName}"`);
      store.storeName = storeName;
    }
    if (latitude) store.latitude = latitude;
    if (longitude) store.longitude = longitude;
    if (address) store.address = address;
    if (phoneNumber) store.phoneNumber = phoneNumber;
    if (contactPerson) store.contactPerson = contactPerson;

    if (userRole === "admin" && store.createdByStaffId.toString() !== userId) {
      store.editedByAdminId = userId;
      if (store.editHistory) {
        store.editHistory.push({
          editedAt: new Date(),
          editedBy: userId,
          changes: changes.join("; ") || "Location updated",
        });
      } else {
        store.editHistory = [
          {
            editedAt: new Date(),
            editedBy: userId,
            changes: changes.join("; ") || "Location updated",
          },
        ];
      }
    }

    store.updatedAt = new Date();
    await store.save();

    res.json({
      message: "Store location updated successfully",
      storeLocation: store,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete store location
exports.deleteStoreLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const store = await StoreLocation.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Store location not found" });
    }

    // Only creator or admin can delete
    if (userRole !== "admin" && store.createdByStaffId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own stores" });
    }

    await StoreLocation.findByIdAndDelete(id);

    res.json({ message: "Store location deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GODOWN LOCATION ENDPOINTS =====

// Create godown location (Admin only)
exports.createGodownLocation = async (req, res) => {
  try {
    const { godownName, latitude, longitude, address, capacity } = req.body;
    const adminId = req.user.userId;

    // Check if godown already exists
    const existingGodown = await GodownLocation.findOne({ createdByAdminId: adminId });
    if (existingGodown) {
      return res.status(400).json({ message: "Godown location already exists. Only one godown per admin." });
    }

    const godown = new GodownLocation({
      godownName,
      createdByAdminId: adminId,
      latitude,
      longitude,
      address,
      capacity,
    });

    await godown.save();

    res.status(201).json({
      message: "Godown location created successfully",
      godown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get godown location
exports.getGodownLocation = async (req, res) => {
  try {
    const godown = await GodownLocation.findOne()
      .populate("createdByAdminId", "name email")
      .exec();

    if (!godown) {
      return res.status(404).json({ message: "Godown location not found" });
    }

    res.json(godown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update godown location (Admin only)
exports.updateGodownLocation = async (req, res) => {
  try {
    const { godownName, latitude, longitude, address, capacity } = req.body;

    let godown = await GodownLocation.findOne();

    if (!godown) {
      return res.status(404).json({ message: "Godown location not found" });
    }

    if (godownName) godown.godownName = godownName;
    if (latitude) godown.latitude = latitude;
    if (longitude) godown.longitude = longitude;
    if (address) godown.address = address;
    if (capacity !== undefined) godown.capacity = capacity;

    godown.updatedAt = new Date();
    await godown.save();

    res.json({
      message: "Godown location updated successfully",
      godown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update godown currentLoad (auto-updated when deliveries are fulfilled)
exports.updateGodownLoad = async (req, res) => {
  try {
    const { currentLoad } = req.body;

    let godown = await GodownLocation.findOne();

    if (!godown) {
      return res.status(404).json({ message: "Godown location not found" });
    }

    godown.currentLoad = currentLoad;
    godown.updatedAt = new Date();
    await godown.save();

    res.json({
      message: "Godown load updated successfully",
      godown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
