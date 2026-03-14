const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const router = express.Router();

router.post("/", authenticate, authorize(["admin"]), createItem);
router.get("/", authenticate, getAllItems);
router.get("/:id", authenticate, getItemById);
router.put("/:id", authenticate, authorize(["admin"]), updateItem);
router.delete("/:id", authenticate, authorize(["admin"]), deleteItem);

module.exports = router;
