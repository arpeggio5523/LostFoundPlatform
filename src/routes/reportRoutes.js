import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  createReport,
  getReport,
  listReports,
  rejectReport,
  removeReportedUser,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", requireAuth, createReport);

router.get("/", requireAdmin, listReports);
router.get("/:id", requireAdmin, getReport);
router.patch("/:id/remove-user", requireAdmin, removeReportedUser);
router.patch("/:id/reject", requireAdmin, rejectReport);

export default router;
