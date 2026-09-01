import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", requireAdmin, getAnalytics);

export default router;