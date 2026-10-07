import { notifyModeration, notifyReportChange, notifyAdminsOfPendingReport } from "../services/notificationService.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import { sendContactOwnerEmail } from "../utils/emailService.js";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateImageEmbedding } from "../services/imageEmbedding.js";
import { generateImageEmbedding } from "../services/jinaEmbedding.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_STATUSES = ["Approved", "Matched", "Returned"];
const MODERATION_STATUSES = ["Pending", "Approved", "Rejected"];
const LIFECYCLE_STATUSES = ["Matched", "Returned"];
const ALLOWED_STATUSES = [...MODERATION_STATUSES, ...LIFECYCLE_STATUSES];
const ALLOWED_ADMIN_STATUS_UPDATES = ALLOWED_STATUSES;
const ALLOWED_OWNER_STATUS_UPDATES = LIFECYCLE_STATUSES;

const isAdminUser = (user) => String(user?.role || "").toLowerCase() === "admin";
const isItemOwner = (item, user) => Boolean(user?.id && String(item.reportedBy?._id || item.reportedBy) === String(user.id));

const updateImageEmbedding = (item, embedding) => {
  if (!embedding) {
    item.imageEmbedding = undefined;
    return;
  }
  item.imageEmbedding = validateImageEmbedding(embedding);
};

const isBase64DataUrl = (str) => typeof str === "string" && str.startsWith("data:");

const autoGenerateEmbedding = async (item, images) => {
  const firstImage = images?.[0];
  if (!isBase64DataUrl(firstImage)) return;
  try {
    const embedding = await generateImageEmbedding(firstImage);
    updateImageEmbedding(item, embedding);
  } catch (err) {
    console.warn("[image-embedding] Failed to generate embedding:", err.message);
  }
};

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

    if (LIFECYCLE_STATUSES.includes(status) && !PUBLIC_STATUSES.includes(item.status)) {
      return res.status(400).json({ error: "Only approved items can be marked as matched or returned." });
    }

    if (status === "Matched" && item.status !== "Approved") {
      return res.status(400).json({ error: "Only approved items can be marked as matched." });
    }

    // Use updateOne to avoid full document validation on legacy or E2E test data
    await Item.updateOne({ _id: itemId }, { $set: { status } }, { runValidators: true });
    const previousStatus = item.status;
    item.status = status;
    if (isAdmin) await notifyModeration(req.app?.get("io"), item, previousStatus);

    res.status(200).json({
      message: "Item status updated",
      data: item
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
  "Keys", "Clothing", "Books", "Sports Equipment", "Jewelry", "Other"
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
  "Multimedia University (MMU)"
];
const ALLOWED_TYPES = ["Lost", "Found"];

const isValidReportLocation = (rl) =>
  rl &&
  rl.type === "Point" &&
  Array.isArray(rl.coordinates) &&
  rl.coordinates.length === 2 &&
  rl.coordinates.every((n) => typeof n === "number") &&
  Math.abs(rl.coordinates[0]) <= 180 &&
  Math.abs(rl.coordinates[1]) <= 90;

const buildItemPayload = (body, userId) => ({
  title: body.title,
  description: body.description,
  category: body.category,
  type: body.type,
  location: body.location,
  exactLocation: body.exactLocation || undefined,
  date: body.date,
  color: body.color || undefined,
  distMark: body.distMark || undefined,
  images: body.images || [],
  status: "Pending",
  reportedBy: userId,
  user: body.user,
  reportLocation: {
    type: "Point",
    coordinates: body.reportLocation?.coordinates || [],
    formattedAddress: body.reportLocation?.formattedAddress || ""
  }
});

export const createItem = async (req, res) => {
  try {
    const {
      title, description, category, type, location, date, images, user, reportLocation, embedding
    } = req.body;

    const missing = [];
    if (!title) missing.push("title");
    if (!description) missing.push("description");
    if (!category) missing.push("category");
    if (!type) missing.push("type");
    if (!location) missing.push("location");
    if (!date) missing.push("date");
    if (!user) missing.push("user");
    if (!isValidReportLocation(reportLocation)) missing.push("reportLocation");

    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}`, missingFields: missing });
    }

    if (!ALLOWED_TYPES.includes(type)) return res.status(400).json({ error: `Invalid type. Must be one of: ${ALLOWED_TYPES.join(", ")}` });
    if (!ALLOWED_CATEGORIES.includes(category)) return res.status(400).json({ error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(", ")}` });
    if (!ALLOWED_LOCATIONS.includes(location)) return res.status(400).json({ error: `Invalid location. Must be one of: ${ALLOWED_LOCATIONS.join(", ")}` });
    if (isNaN(new Date(date).getTime())) return res.status(400).json({ error: "Invalid date format." });
    if (images && images.length > 5) return res.status(400).json({ error: "Maximum of 5 images are allowed." });

    const newItem = new Item(buildItemPayload(req.body, req.user.id));

    if (embedding) {
      updateImageEmbedding(newItem, embedding);
    } else {
      await autoGenerateEmbedding(newItem, images);
    }

    const savedItem = await newItem.save();

    const qrDirectory = path.join(__dirname, "../../uploads/qrcodes");
    if (!fs.existsSync(qrDirectory)) {
      fs.mkdirSync(qrDirectory, { recursive: true });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const itemUrl = `${frontendUrl}/item/${savedItem._id}`;
    const qrFileName = `qr-${savedItem._id}.png`;
    const qrFilePath = path.join(qrDirectory, qrFileName);
    await QRCode.toFile(qrFilePath, itemUrl);

    savedItem.qrCodePath = `/uploads/qrcodes/${qrFileName}`;
    await savedItem.save();

    // The report is already saved; notification failures must not invite a duplicate submission.
    try {
      await notifyAdminsOfPendingReport(req.app?.get("io"), savedItem);
    } catch (err) {
      console.error("Pending report notification error:", err);
    }

    return res.status(201).json({
      message: `${type} item report submitted successfully.`,
      data: savedItem
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

export const getItems = async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);
    const currentUserId = req.user?.id;

    // Validate type filter
    if (req.query.type && !ALLOWED_TYPES.includes(req.query.type)) {
      return res.status(400).json({ error: `Invalid type filter. Must be Lost or Found.` });
    }

    // Validate status filter
    if (req.query.status && !ALLOWED_STATUSES.includes(req.query.status)) {
      return res.status(400).json({ error: `Invalid status filter.` });
    }

    const typeFilter = req.query.type ? { type: req.query.type } : {};
    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    const locationFilter = req.query.location ? { location: new RegExp(req.query.location, "i") } : {};
    const extraFilters = { ...typeFilter, ...categoryFilter, ...locationFilter };

    let filter;

    if (isAdmin) {
      // Admins see everything; optional status filter applied directly
      filter = { ...extraFilters };
      if (req.query.status) filter.status = req.query.status;
    } else {
      // Non-admins: see public items from everyone, PLUS all their own items
      const requestedStatus = req.query.status;

      // Condition A: public items (not owned by current user, public statuses only)
      const publicCondition = {
        ...extraFilters,
        status: requestedStatus && PUBLIC_STATUSES.includes(requestedStatus)
          ? requestedStatus
          : { $in: PUBLIC_STATUSES },
        ...(currentUserId ? { reportedBy: { $ne: currentUserId } } : {}),
      };

      // Condition B: the current user's own items (any status)
      const ownCondition = currentUserId
        ? {
            ...extraFilters,
            reportedBy: currentUserId,
            ...(requestedStatus ? { status: requestedStatus } : {}),
          }
        : null;

      filter = ownCondition
        ? { $or: [publicCondition, ownCondition] }
        : publicCondition;
    }

    const items = await Item.find(filter).populate("reportedBy", "fullName email").sort({ createdAt: -1 });
    return res.status(200).json({ count: items.length, data: items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate("reportedBy", "fullName email");
    if (!item) return res.status(404).json({ error: "Item not found." });

    const canViewModeratedItem =
      PUBLIC_STATUSES.includes(item.status) ||
      isAdminUser(req.user) ||
      isItemOwner(item, req.user);

    if (!canViewModeratedItem) return res.status(404).json({ error: "Item not found." });
 
    return res.status(200).json({ data: item });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

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
    const embedding = req.body.embedding;
    const type = req.body.type || req.query.type;
    const limit = req.body.limit || req.query.limit || 10;
    const excludeId = req.body.excludeId || req.query.excludeId;

    if (type && !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid type. Must be Lost or Found." });
    }

    const numericLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const queryVector = validateImageEmbedding(embedding);
    const filter = type ? { type: { $eq: type } } : undefined;
    const minScore = Number(req.body.minScore || req.query.minScore) || 0.80;

    const matchStage = { similarityScore: { $gte: minScore } };
    const isAdmin = isAdminUser(req.user);
    if (!isAdmin) {
      matchStage.status = { $in: PUBLIC_STATUSES };
    }

    const pipeline = [
      {
        $vectorSearch: {
          index: process.env.MONGODB_VECTOR_INDEX || "item_image_vector_index",
          path: "imageEmbedding",
          queryVector,
          numCandidates: Math.max(numericLimit * 10, 100),
          limit: Math.max(numericLimit * 3, 50),
          ...(filter ? { filter } : {}),
        },
      },
      { $set: { mongoScore: { $meta: "vectorSearchScore" } } },
      { $set: { similarityScore: { $subtract: [ { $multiply: ["$mongoScore", 2] }, 1 ] } } },
      { $match: matchStage },
      { $project: { imageEmbedding: 0 } },
    ];

    let items = await Item.aggregate(pipeline);
    if (excludeId) items = items.filter((i) => String(i._id) !== String(excludeId));
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

    req.body = { ...req.body, embedding: item.imageEmbedding, excludeId: item._id };
    return findSimilarItems(req, res);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found." });

    const isOwner = String(item.reportedBy) === String(req.user.id);
    const isAdmin = String(req.user.role).toLowerCase() === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You do not have permission to update this item." });
    }

    if (!isAdmin && item.status !== "Pending") {
      return res.status(403).json({ error: "You can only edit posts while they are pending approval." });
    }

    const previousStatus = item.status;
    const {
      title, description, category, type, location, exactLocation, date, color, distMark, images, status, reportLocation, user, embedding
    } = req.body;

    if (status !== undefined) {
      if (!isAdmin) return res.status(403).json({ error: "Only administrators can change an item's status while editing." });
      if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}.` });
      item.status = status;
    }

    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (type) item.type = type;
    if (location) item.location = location;
    if (exactLocation !== undefined) item.exactLocation = exactLocation;
    if (date) item.date = date;
    if (color !== undefined) item.color = color;
    if (distMark !== undefined) item.distMark = distMark;
    if (images !== undefined) item.images = images;
    if (user) item.user = user;

    if (reportLocation !== undefined) {
      if (!isValidReportLocation(reportLocation)) {
        return res.status(400).json({ error: "Invalid or missing reportLocation.", missingFields: ["reportLocation"] });
      }
      item.reportLocation = {
        type: "Point",
        coordinates: reportLocation.coordinates,
        formattedAddress: reportLocation.formattedAddress || ""
      };
    }

    if (images !== undefined) {
      if (embedding) {
        updateImageEmbedding(item, embedding);
      } else {
        await autoGenerateEmbedding(item, images);
      }
    }

    const updated = await item.save();
    if (isAdmin) await notifyReportChange(req.app?.get("io"), updated, "edited", previousStatus);
    return res.status(200).json({ message: "Item updated.", data: updated });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join("; ") });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found." });

    const isOwner = String(item.reportedBy) === String(req.user.id);
    const isAdmin = String(req.user.role).toLowerCase() === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You do not have permission to delete this item." });
    }

    await item.deleteOne();
    if (isAdmin) await notifyReportChange(req.app?.get("io"), item, "deleted");
    return res.status(200).json({ message: "Item deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const contactOwner = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate("reportedBy", "fullName email");
    if (!item) return res.status(404).json({ error: "Item not found." });
    if (!PUBLIC_STATUSES.includes(item.status)) return res.status(404).json({ error: "Item not found." });

    const owner = item.reportedBy;
    if (!owner) return res.status(404).json({ error: "Owner not found." });
    if (String(owner._id) === String(req.user.id)) return res.status(400).json({ error: "You cannot contact yourself." });

    const sender = await User.findById(req.user.id);
    if (!sender) return res.status(404).json({ error: "Sender not found." });

    await sendContactOwnerEmail({
      ownerEmail: owner.email,
      ownerName: owner.fullName,
      postTitle: item.title,
      senderEmail: sender.email
    });

    return res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const embedImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || !isBase64DataUrl(imageBase64)) {
      return res.status(400).json({ error: "imageBase64 must be a valid base64 data URL (e.g. \"data:image/png;base64,...\")." });
    }
    const embedding = await generateImageEmbedding(imageBase64);
    return res.status(200).json({ embedding });
  } catch (err) {
    console.error("[embed-image] Error:", err.message);
    return res.status(502).json({ error: `Failed to generate image embedding: ${err.message}` });
  }
};
