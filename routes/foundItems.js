import express from "express";
import {
  createFoundItem,
  getFoundItem,
  listFoundItems,
  deleteFoundItem,
  updateFoundItem
} from "../controllers/foundItemController.js";

const router = express.Router();

router.post("/", createFoundItem);
router.get("/", listFoundItems);
router.get("/:id", getFoundItem);
router.delete("/:id", deleteFoundItem);
router.put("/:id", updateFoundItem);

export default router;
