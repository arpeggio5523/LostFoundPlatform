// This file is used by Subteam1 to handle validationn logic for the LostItem model when creating or updating lost item records in the database.
// It ensures that all required fields are present and correctly formatted before allowing the operation to proceed.

import Item from "../models/Item.js";

export const updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const item = await Item.findOneAndUpdate(
      { _id: itemId },
      { $set: { status: status } },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json({
      message: "Item status updated",
      data: item
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getApprovedFoundItems = async (req, res) => {
  try {
    const items = await Item.find({
      itemType: "Found",
      status: "Approved",
    });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};