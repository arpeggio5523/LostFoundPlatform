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
} from "../controllers/ItemController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/items          — list all items (optionally filtered by ?type=Lost|Found)
router.get("/", getItems);

// GET /api/items/my       — items reported by the logged-in user (must be before /:itemId)
router.get("/my", requireAuth, getMyItems);

// GET /api/items/:itemId  — single item detail
router.get("/:itemId", getItemById);

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