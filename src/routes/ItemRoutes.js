import express from "express";
import {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItemStatus,
  updateItem,
  deleteItem,
  contactOwner,
  findSimilarItems,
  findSimilarItemsById,
  embedImage,
} from "../controllers/ItemController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/items          — list all items (optionally filtered by ?type=Lost|Found)
router.get("/", getItems);

// GET /api/items/my       — items reported by the logged-in user (must be before /:itemId)
router.get("/my", requireAuth, getMyItems);

// POST /api/items/similar — find items similar to an uploaded image embedding
router.post("/similar", requireAuth, findSimilarItems);

// POST /api/items/embed-image — generate an embedding for a base64 image (browse-page search proxy)
router.post("/embed-image", requireAuth, embedImage);

// GET /api/items/:itemId  — single item detail
router.get("/:itemId", getItemById);

// GET /api/items/:itemId/similar — find items similar to an existing item
router.get("/:itemId/similar", requireAuth, findSimilarItemsById);

// POST /api/items         — create a new Lost or Found item report
router.post("/", requireAuth, createItem);

// DELETE /api/items/:itemId     — delete item (owner only)
router.delete("/:itemId", requireAuth, deleteItem);

// PUT /api/items/:itemId        — update full item (owner only)
router.put("/:itemId", requireAuth, updateItem);

// PUT /api/items/:itemId/status — update item status only
router.put("/:itemId/status", requireAuth, updateItemStatus);

// POST /api/items/:itemId/contact — contact the owner
router.post("/:itemId/contact", requireAuth, contactOwner);

export default router;