// This file is used by Subteam1 to handle validationn logic for the LostItem model when creating or updating lost item records in the database.
// It ensures that all required fields are present and correctly formatted before allowing the operation to proceed.

import Item from "../models/Item.js";
import User from "../models/User.js";
import { sendContactOwnerEmail } from "../utils/emailService.js";

const PUBLIC_STATUSES = ["Approved", "Matched", "Returned"];
const MODERATION_STATUSES = ["Pending", "Approved", "Rejected"];
const ALLOWED_STATUSES = [...MODERATION_STATUSES, "Matched", "Returned"];
const ALLOWED_ADMIN_STATUS_UPDATES = MODERATION_STATUSES;
const ALLOWED_OWNER_STATUS_UPDATES = ["Returned"];

const isAdminUser = (user) => String(user?.role || "").toLowerCase() === "admin";

const isItemOwner = (item, user) =>
  Boolean(user?.id && String(item.reportedBy?._id || item.reportedBy) === String(user.id));

export const updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}.`,
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    const isAdmin = isAdminUser(req.user);
    const isOwner = isItemOwner(item, req.user);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "You do not have permission to update this item." });
    }

    if (isAdmin && !ALLOWED_ADMIN_STATUS_UPDATES.includes(status)) {
      return res.status(400).json({
        error: `Administrators can only set moderation statuses: ${ALLOWED_ADMIN_STATUS_UPDATES.join(", ")}.`,
      });
    }

    if (!isAdmin && !ALLOWED_OWNER_STATUS_UPDATES.includes(status)) {
      return res.status(400).json({
        error: `Item owners can only set statuses: ${ALLOWED_OWNER_STATUS_UPDATES.join(", ")}.`,
      });
    }

    if (!isAdmin && !PUBLIC_STATUSES.includes(item.status)) {
      return res.status(400).json({ error: "Only approved items can be marked as returned." });
    }

    item.status = status;
    const updatedItem = await item.save();

    res.status(200).json({
      message: "Item status updated",
      data: updatedItem,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join("; ") });
    }
    res.status(500).json({ error: err.message });
  }
};

const ALLOWED_CATEGORIES = [
  "Electronics", "Accessories", "Bag & Backpacks", "Documents",
  "Keys", "Clothing", "Books", "Sports Equipment", "Jewelry", "Other",
];

const ALLOWED_LOCATIONS = [
  "Universiti Malaya (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Putra Malaysia (UPM) Central Library",
  "Universiti Teknologi Malaysia (UTM)",
  "Universiti Teknologi MARA (UiTM)",
  "Taylor's University",
  "Sunway University",
  "Multimedia University (MMU)",
];
 
const ALLOWED_TYPES    = ["Lost", "Found"];
 
 
const buildItemPayload = (body, userId) => ({
  title:       body.title,
  description: body.description,
  category:    body.category,
  type:        body.type,
  location:    body.location,
  exactLocation: body.exactLocation || undefined,
  date:        body.date,
  color:       body.color       || undefined,
  distMark:    body.distMark    || undefined,
  images:      body.images      || [],
  status:      "Pending",
  reportedBy:  userId,                  // from auth middleware
  user:        body.user,               // display name passed from client
});
 
/**
 * POST /api/items
 * Create a new Lost or Found item report.
 */
export const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date, images, user } = req.body;
 
    // Required field check
    const missing = [];
    if (!title)       missing.push("title");
    if (!description) missing.push("description");
    if (!category)    missing.push("category");
    if (!type)        missing.push("type");
    if (!location)    missing.push("location");
    if (!date)        missing.push("date");
    if (!user)        missing.push("user");
 
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
 
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${ALLOWED_TYPES.join(", ")}` });
    }
 
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(", ")}` });
    }

    if (!ALLOWED_LOCATIONS.includes(location)) {
      return res.status(400).json({ error: `Invalid location. Must be one of: ${ALLOWED_LOCATIONS.join(", ")}` });
    }
 
    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }
 
    if (images && images.length > 5) {
      return res.status(400).json({ error: "Maximum of 5 images are allowed." });
    }
 
    const newItem = new Item(buildItemPayload(req.body, req.user.id));
    const savedItem = await newItem.save();
 
    return res.status(201).json({
      message: `${type} item report submitted successfully.`,
      data: savedItem,
    });
 
  } catch (err) {
    console.error("Item creation error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join("; ") });
    }
    return res.status(500).json({ error: err.message });
  }
};
 
/**
 * GET /api/items
 * Get all items. 
 */
export const getItems = async (req, res) => {
  try {
    const filter = {};
    const isAdmin = isAdminUser(req.user);
 
    if (req.query.type) {
      if (!ALLOWED_TYPES.includes(req.query.type)) {
        return res.status(400).json({ error: `Invalid type filter. Must be Lost or Found.` });
      }
      filter.type = req.query.type;
    }
 
    if (req.query.status) {
      if (!ALLOWED_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ error: `Invalid status filter.` });
      }

      filter.status = req.query.status;
    }

    if (!isAdmin) {
      filter.status = req.query.status && PUBLIC_STATUSES.includes(req.query.status)
        ? req.query.status
        : { $in: PUBLIC_STATUSES };
    }

    if (req.query.category) filter.category = req.query.category;
    if (req.query.location) filter.location = new RegExp(req.query.location, "i"); // partial match
 
    const items = await Item.find(filter)
      .populate("reportedBy", "fullName email")
      .sort({ createdAt: -1 });
 
    return res.status(200).json({ count: items.length, data: items });
 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
 
/**
 * GET /api/items/:itemId
 * Get a single item by its MongoDB _id.
 */
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate("reportedBy", "fullName email");
 
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    const canViewModeratedItem =
      PUBLIC_STATUSES.includes(item.status) ||
      isAdminUser(req.user) ||
      isItemOwner(item, req.user);

    if (!canViewModeratedItem) {
      return res.status(404).json({ error: "Item not found." });
    }
 
    return res.status(200).json({ data: item });
 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
 
/**
 * GET /api/items/my
 * Get all items reported by the currently logged-in user.
 */
export const getMyItems = async (req, res) => {
  try {
    const filter = { reportedBy: req.user.id };
    if (req.query.type) filter.type = req.query.type;
 
    const items = await Item.find(filter).sort({ createdAt: -1 });
 
    return res.status(200).json({ count: items.length, data: items });
 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/items/:itemId
 * Update an existing item (owner only).
 */
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    const userId = req.user.id || req.user._id || req.user.userId;
    const isOwner = String(item.reportedBy) === String(req.user.id);
    const isAdmin = String(req.user.role).toLowerCase() === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You do not have permission to update this item." });
    }

    const { title, description, category, type, location, exactLocation, date, color, distMark, images } = req.body;

    if (title)       item.title       = title;
    if (description) item.description = description;
    if (category)    item.category    = category;
    if (type)        item.type        = type;
    if (location)    item.location    = location;
    if (exactLocation !== undefined) item.exactLocation = exactLocation;
    if (date)        item.date        = date;
    if (color  !== undefined) item.color    = color;
    if (distMark !== undefined) item.distMark = distMark;
    if (images !== undefined) item.images   = images;

    const updated = await item.save();
    return res.status(200).json({ message: "Item updated.", data: updated });

  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join("; ") });
    }
    return res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/items/:itemId
 * Delete an item (owner or administrator).
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    const isOwner = String(item.reportedBy) === String(req.user.id);
    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You do not have permission to delete this item." });
    }

    await item.deleteOne();
    return res.status(200).json({ message: "Item deleted successfully." });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/items/:itemId/contact
 * Send an email to the owner of the item.
 */
export const contactOwner = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate("reportedBy", "fullName email");

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    if (!PUBLIC_STATUSES.includes(item.status)) {
      return res.status(404).json({ error: "Item not found." });
    }

    const owner = item.reportedBy;
    if (!owner) {
      return res.status(404).json({ error: "Owner not found." });
    }

    if (String(owner._id) === String(req.user.id)) {
      return res.status(400).json({ error: "You cannot contact yourself." });
    }

    const sender = await User.findById(req.user.id);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }

    await sendContactOwnerEmail({
      ownerEmail: owner.email,
      ownerName: owner.fullName,
      postTitle: item.title,
      senderEmail: sender.email,
    });

    return res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
