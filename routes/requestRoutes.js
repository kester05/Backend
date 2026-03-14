const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  createRequest,
  getStaffRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
  fulfillRequest,
  cancelRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.post("/", authenticate, authorize(["staff"]), createRequest);
router.get("/my-requests", authenticate, authorize(["staff"]), getStaffRequests);
router.get("/", authenticate, authorize(["admin"]), getAllRequests);
router.put("/:id/approve", authenticate, authorize(["admin"]), approveRequest);
router.put("/:id/reject", authenticate, authorize(["admin"]), rejectRequest);
router.put("/:id/fulfill", authenticate, authorize(["admin"]), fulfillRequest);
router.put("/:id/cancel", authenticate, cancelRequest);

module.exports = router;
