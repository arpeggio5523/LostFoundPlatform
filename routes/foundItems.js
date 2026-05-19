import express from "express";
import {
  createFoundItem,
  getFoundItem,
  listFoundItems,
  updateFoundItem,
  deleteFoundItem
} from "../controllers/foundItemController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, createFoundItem);
router.get("/", listFoundItems);
router.get("/:id", getFoundItem);
router.put("/:id", requireAuth, updateFoundItem);
router.delete("/:id", requireAuth, deleteFoundItem);
export default router;
