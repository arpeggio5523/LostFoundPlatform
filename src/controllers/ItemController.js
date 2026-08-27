// This file handles validation logic for Lost/Found item records and image similarity matching.
// Embedding generation is handled automatically via Jina AI when a new base64 image is uploaded.

import Item from "../models/Item.js";
import User from "../models/User.js";
import { sendContactOwnerEmail } from "../utils/emailService.js";
import { validateImageEmbedding } from "../services/imageEmbedding.js";
import { generateImageEmbedding } from "../services/jinaEmbedding.js";

const updateImageEmbedding = (item, embedding) => {
  if (!embedding) {
    item.imageEmbedding = undefined;
    return;
  }

  item.imageEmbedding = validateImageEmbedding(embedding);
};

/**
 * Returns true when the string is a browser-generated base64 data URL
 * (e.g. "data:image/png;base64,..."). Used to detect new image uploads
 * so we only call Jina for freshly uploaded images, not stored URL strings.
 */
const isBase64DataUrl = (str) =>
  typeof str === "string" && str.startsWith("data:");

/**
 * Attempt to auto-generate an image embedding via Jina AI and store it on
 * the item. Failures are logged as warnings but never propagated — item saves
 * must always succeed regardless of embedding availability.
 *
 * @param {object} item - Mongoose Item document (mutated in place)
 * @param {string[]} images - Array of image strings (base64 or URL)
 */
const autoGenerateEmbedding = async (item, images) => {
  const firstImage = images?.[0];
  if (!isBase64DataUrl(firstImage)) return; // skip for URL-only or missing images

  try {
    const embedding = await generateImageEmbedding(firstImage);
    updateImageEmbedding(item, embedding);
  } catch (err) {
    console.warn(
      "[image-embedding] Failed to generate embedding (item will save without vector):",
      err.message
    );
  }
};

export const updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    if (String(item.reportedBy) !== String(req.user.id)) {
      return res.status(403).json({ error: "You do not have permission to update this item." });
    }

    const allowedStatuses = item.type === "Lost" ? ["Lost", "Returned"] : ["Found", "Returned"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status for this item. Allowed statuses are: ${allowedStatuses.join(", ")}.` });
    }

    if (item.status === "Returned" && status !== "Returned") {
      return res.status(400).json({ error: "Returned items cannot be changed back to another status." });
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
 
const ALLOWED_STATUSES = ["Pending", "Approved", "Matched", "Returned"];
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
  status:      "Approved",             
  reportedBy:  userId,                  // from auth middleware
  user:        body.user,               // display name passed from client
});
 
/**
 * POST /api/items
 * Create a new Lost or Found item report.
 */
export const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date, images, user, embedding } = req.body;
 
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

    // If the client explicitly sent a pre-computed embedding, use it.
    // Otherwise, auto-generate from the first image if it's a fresh base64 upload.
    if (embedding) {
      updateImageEmbedding(newItem, embedding);
    } else {
      await autoGenerateEmbedding(newItem, images);
    }

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
 
    if (req.query.type) {
      if (!ALLOWED_TYPES.includes(req.query.type)) {
        return res.status(400).json({ error: `Invalid type filter. Must be Lost or Found.` });
      }
      filter.type = req.query.type;
    }
 
    if (req.query.status)   filter.status   = req.query.status;
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

export const findSimilarItems = async (req, res) => {
  try {
    // Support both body params (POST) and query params (GET) for type and limit.
    const embedding = req.body.embedding;
    const type = req.body.type || req.query.type;
    const limit = req.body.limit || req.query.limit || 10;
    const excludeId = req.body.excludeId || req.query.excludeId; // exclude the source item

    if (type && !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid type. Must be Lost or Found." });
    }

    const numericLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const queryVector = validateImageEmbedding(embedding);
    const filter = type ? { type: { $eq: type } } : undefined;

    const minScore = Number(req.body.minScore || req.query.minScore) || 0.80;

    const pipeline = [
      {
        $vectorSearch: {
          index: process.env.MONGODB_VECTOR_INDEX || "item_image_vector_index",
          path: "imageEmbedding",
          queryVector,
          numCandidates: Math.max(numericLimit * 10, 100),
          limit: numericLimit + (excludeId ? 1 : 0), // fetch extra in case we exclude one
          ...(filter ? { filter } : {}),
        },
      },
      {
        $set: {
          similarityScore: { $meta: "vectorSearchScore" },
        },
      },
      {
        $match: {
          similarityScore: { $gte: minScore }
        }
      },
      { $project: { imageEmbedding: 0 } },
    ];

    let items = await Item.aggregate(pipeline);

    // Exclude the source item itself from results (it would always be a 100% match)
    if (excludeId) {
      items = items.filter((i) => String(i._id) !== String(excludeId));
    }

    // Trim to requested limit after exclusion
    items = items.slice(0, numericLimit);

    return res.status(200).json({ count: items.length, data: items });
  } catch (err) {
    console.error("Similar item search error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const findSimilarItemsById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).select("+imageEmbedding");
    if (!item) return res.status(404).json({ error: "Item not found." });

    if (!item.imageEmbedding || item.imageEmbedding.length === 0) {
      return res.status(400).json({ error: "This item has no image embedding to compare." });
    }

    // Forward query params (type, limit) and inject the stored embedding + excludeId
    // so the source item doesn't appear in its own results.
    req.body = {
      ...req.body,
      embedding: item.imageEmbedding,
      excludeId: item._id,
    };
    return findSimilarItems(req, res);
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

    if (String(item.reportedBy) !== String(req.user.id)) {
      return res.status(403).json({ error: "You do not have permission to update this item." });
    }

    const { title, description, category, type, location, exactLocation, date, color, distMark, images, user, embedding } = req.body;

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
    if (user)        item.user        = user;

    // Embedding update logic:
    // 1. If client explicitly sent embedding — use it (override).
    // 2. Else if images changed and new image is a fresh base64 upload — auto-generate.
    // 3. Else if images changed but no new base64 (kept existing URL) — clear old embedding.
    if (images !== undefined) {
      if (embedding) {
        updateImageEmbedding(item, embedding);
      } else {
        await autoGenerateEmbedding(item, images);
      }
    }

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
 * Delete an item (owner only).
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    if (String(item.reportedBy) !== String(req.user.id)) {
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

/**
 * POST /api/items/embed-image
 * Proxy endpoint: accepts a base64 image from the browser, calls Jina AI, and
 * returns the embedding vector. This lets the frontend perform image-based search
 * without exposing the Jina API key to the client.
 *
 * Body: { imageBase64: string }   — a data URL ("data:image/...;base64,...")
 * Returns: { embedding: number[] }
 *
 * Requires authentication to prevent abuse.
 */
export const embedImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64 || !isBase64DataUrl(imageBase64)) {
      return res.status(400).json({
        error: "imageBase64 must be a valid base64 data URL (e.g. \"data:image/png;base64,...\").",
      });
    }

    const embedding = await generateImageEmbedding(imageBase64);
    return res.status(200).json({ embedding });
  } catch (err) {
    console.error("[embed-image] Error:", err.message);
    return res.status(502).json({
      error: `Failed to generate image embedding: ${err.message}`,
    });
  }
};