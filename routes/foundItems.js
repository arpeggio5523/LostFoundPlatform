import express from "express";
import {
  createFoundItem,
  getFoundItem,
  listFoundItems,
  updateFoundItem,
  deleteFoundItem
} from "../controllers/foundItemController.js";

const router = express.Router();

router.post("/", createFoundItem);
router.get("/", listFoundItems);
router.get("/:id", getFoundItem);
router.put("/:id", updateFoundItem);
router.delete("/:id", deleteFoundItem);
export default router;
