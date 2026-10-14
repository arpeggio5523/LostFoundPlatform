import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Report, { REPORT_CATEGORIES } from "../models/Report.js";
import User from "../models/User.js";
import { encrypt, decrypt } from "../utils/cryptoUtils.js";
import { validateMessageImage } from "../utils/messageAttachments.js";
import { revokeAllUserSessions } from "../utils/authSession.js";

const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 1000;
const LIST_STATUSES = ["Pending", "Resolved", "Rejected"];

const userSummary = "_id fullName email role isRemoved";

const adminNoteFrom = (body) =>
  typeof body?.adminNote === "string" ? body.adminNote.trim().slice(0, 500) : "";

export const createReport = async (req, res) => {
  try {
    const { conversationId, category, description, evidenceImage } = req.body;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "A valid conversation is required." });
    }
    if (!REPORT_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Choose a type of misconduct." });
    }
    const trimmed = typeof description === "string" ? description.trim() : "";
    if (trimmed.length < MIN_DESCRIPTION || trimmed.length > MAX_DESCRIPTION) {
      return res.status(400).json({
        message: `Description must be between ${MIN_DESCRIPTION} and ${MAX_DESCRIPTION} characters.`,
      });
    }
    if (!evidenceImage) {
      return res.status(400).json({ message: "A screenshot is required as evidence." });
    }
    const imageError = validateMessageImage(evidenceImage);
    if (imageError) return res.status(400).json({ message: imageError });

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // The reported user is always the other participant, so a reporter cannot target an arbitrary account.
    const reportedUserId = conversation.participants.find(
      (participantId) => String(participantId) !== String(req.user.id)
    );
    if (!reportedUserId) {
      return res.status(400).json({ message: "You cannot report yourself." });
    }

    const reportedUser = await User.findById(reportedUserId, userSummary).lean();
    if (!reportedUser) {
      return res.status(404).json({ message: "Reported user not found" });
    }
    if (reportedUser.role === "Admin") {
      return res.status(403).json({ message: "Administrators cannot be reported." });
    }

    const existing = await Report.findOne({
      reporter: req.user.id,
      reportedUser: reportedUserId,
      status: "Pending",
    });
    if (existing) {
      return res.status(409).json({ message: "You already have a pending report against this user." });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: reportedUserId,
      conversation: conversation._id,
      category,
      description: trimmed,
      evidenceImage: encrypt(evidenceImage),
    });

    return res.status(201).json({
      message: "Report submitted. An administrator will review it.",
      data: { _id: report._id, status: report.status, category: report.category },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit report", error: error.message });
  }
};

export const listReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      if (!LIST_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: "Invalid status filter." });
      }
      filter.status = req.query.status;
    }

    // Evidence is omitted from the list; fetch it per report to keep the payload small.
    const reports = await Report.find(filter)
      .select("-evidenceImage")
      .populate("reporter", userSummary)
      .populate("reportedUser", userSummary)
      .populate("reviewedBy", "_id fullName")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ data: reports });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reports", error: error.message });
  }
};

export const getReport = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Report not found" });
    }
    const report = await Report.findById(req.params.id)
      .populate("reporter", userSummary)
      .populate("reportedUser", userSummary)
      .populate("reviewedBy", "_id fullName")
      .lean();

    if (!report) return res.status(404).json({ message: "Report not found" });

    return res.json({
      data: { ...report, evidenceImage: report.evidenceImage ? decrypt(report.evidenceImage) : null },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load report", error: error.message });
  }
};

// Resolves the report named in the URL and ensures it can still be actioned.
const loadPendingReport = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Report not found" });
    return null;
  }
  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404).json({ message: "Report not found" });
    return null;
  }
  if (report.status !== "Pending") {
    res.status(409).json({ message: `This report has already been ${report.status.toLowerCase()}.` });
    return null;
  }
  return report;
};

export const removeReportedUser = async (req, res) => {
  try {
    const report = await loadPendingReport(req, res);
    if (!report) return;

    const target = await User.findById(report.reportedUser);
    if (!target) {
      return res.status(404).json({ message: "Reported user no longer exists." });
    }
    if (target.role === "Admin" || String(target._id) === String(req.user.id)) {
      return res.status(403).json({ message: "This user cannot be removed." });
    }

    const now = new Date();
    target.isRemoved = true;
    target.removedAt = now;
    await target.save();
    await revokeAllUserSessions(target._id);

    // Every open report against this user is settled by the removal.
    await Report.updateMany(
      { reportedUser: target._id, status: "Pending" },
      {
        $set: {
          status: "Resolved",
          reviewedBy: req.user.id,
          reviewedAt: now,
          adminNote: adminNoteFrom(req.body),
        },
      }
    );

    req.app.get("io")?.in(String(target._id)).disconnectSockets(true);

    return res.json({ message: "User removed and report resolved." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove user", error: error.message });
  }
};

export const rejectReport = async (req, res) => {
  try {
    const report = await loadPendingReport(req, res);
    if (!report) return;

    report.status = "Rejected";
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();
    report.adminNote = adminNoteFrom(req.body);
    await report.save();

    return res.json({ message: "Report rejected." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject report", error: error.message });
  }
};
