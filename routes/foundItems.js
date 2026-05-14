import express from "express";
import {
  createFoundItem,
  getFoundItem,
  listFoundItems
} from "../controllers/foundItemController.js";

const router = express.Router();

router.post("/", createFoundItem);
router.get("/", listFoundItems);
router.get("/:id", getFoundItem);

export default router;
