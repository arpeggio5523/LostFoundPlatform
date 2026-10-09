import express from "express";
import { detectQueryLanguage, translateQueryToEnglish } from "../controllers/languageController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/detect", requireAuth, detectQueryLanguage);
router.post("/translate", requireAuth, translateQueryToEnglish);

export default router;
