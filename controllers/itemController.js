const Item = require("../models/Item");

exports.createItem = async (req, res) => {
  try {
    const { name, description, quantity, maxQuantity, unit } = req.body;

    const item = new Item({
      name,
      description,
      quantity,
      maxQuantity,
      unit,
    });

    await item.save();
    res.status(201).json({ message: "Item created successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { name, description, quantity, maxQuantity, unit } = req.body;

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description, quantity, maxQuantity, unit, updatedAt: Date.now() },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
