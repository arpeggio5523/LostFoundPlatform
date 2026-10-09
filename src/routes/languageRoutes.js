import express from "express";
import { detectQueryLanguage } from "../controllers/languageController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/detect", requireAuth, detectQueryLanguage);

export default router;
