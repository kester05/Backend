const Request = require("../models/Request");
const Item = require("../models/Item");

exports.createRequest = async (req, res) => {
  try {
    const { itemId, requestedQuantity, reason } = req.body;
    const staffId = req.user.userId;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (requestedQuantity > item.maxQuantity) {
      return res.status(400).json({
        message: `Requested quantity exceeds maximum limit of ${item.maxQuantity}`,
      });
    }

    const request = new Request({
      staffId,
      itemId,
      requestedQuantity,
      reason,
    });

    await request.save();
    res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffRequests = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const requests = await Request.find({ staffId })
      .populate("itemId", "name unit")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("staffId", "name email")
      .populate("itemId", "name unit")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { approvedQuantity, adminComment } = req.body;
    const adminId = req.user.userId;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (approvedQuantity > request.requestedQuantity) {
      return res.status(400).json({
        message: "Approved quantity cannot exceed requested quantity",
      });
    }

    const item = await Item.findById(request.itemId);
    if (approvedQuantity > item.quantity) {
      return res.status(400).json({
        message: `Insufficient inventory. Available: ${item.quantity}`,
      });
    }

    request.status = "approved";
    request.approvedQuantity = approvedQuantity;
    request.adminComment = adminComment;
    request.approvedBy = adminId;
    request.updatedAt = Date.now();

    await request.save();
    res.json({ message: "Request approved successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { adminComment } = req.body;
    const adminId = req.user.userId;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    request.adminComment = adminComment;
    request.approvedBy = adminId;
    request.updatedAt = Date.now();

    await request.save();
    res.json({ message: "Request rejected successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.fulfillRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "approved") {
      return res.status(400).json({
        message: "Only approved requests can be fulfilled",
      });
    }

    const item = await Item.findById(request.itemId);
    item.quantity -= request.approvedQuantity;
    await item.save();

    request.status = "fulfilled";
    request.updatedAt = Date.now();
    await request.save();

    res.json({ message: "Request fulfilled successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending" && request.status !== "approved") {
      return res.status(400).json({
        message: "Only pending or approved requests can be cancelled",
      });
    }

    // Check if user is the requester or admin
    if (req.user.role !== "admin" && req.user.userId !== request.staffId.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }

    request.status = "cancelled";
    request.updatedAt = Date.now();
    await request.save();

    res.json({ message: "Request cancelled successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
