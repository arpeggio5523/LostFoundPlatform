// This file is used by Subteam1 to handle validationn logic for the LostItem model when creating or updating lost item records in the database.
// It ensures that all required fields are present and correctly formatted before allowing the operation to proceed.

import Item from "../models/Item.js";

export const updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    // Status validation
    if (!status) {
      return res.status(400).json({ error: "Please provide a status update."});
    }

    const item = await Item.findOne({ item_id: itemId });
    if (!item) {
      return res.status(404).json({ error: "Item not found."});
    }

    item.status = status;
    const updatedItem = await item.save();

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found."});
    }

    res.status(200).json({
      message: "Item status updated",
      data: updatedItem
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};