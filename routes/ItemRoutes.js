import express from "express";
import { updateItemStatus } from "../controllers/itemController.js";

const router = express.Router();

router.put("/items/:itemId/status", updateItemStatus);

export default router;