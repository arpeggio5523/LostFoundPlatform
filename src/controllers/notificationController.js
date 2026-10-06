import mongoose from "mongoose";
import Notification from "../models/Notification.js";

export async function getNotifications(req, res) {
  try {
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
    const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 25)));
    const filter = { recipient: req.user.id };
    if (req.query.filter === "unread") filter.readAt = null;
    if (req.query.filter === "messages") filter.type = "message";
    if (req.query.filter === "moderation") filter.type = { $in: ["approved", "rejected", "edited", "deleted", "matched", "returned"] };
    const [data, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user.id, readAt: null }),
    ]);
    res.json({ data, total, unreadCount, page, limit });
  } catch {
    res.status(500).json({ message: "Failed to load notifications" });
  }
}

export async function markNotificationRead(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid notification ID" });
  try {
    const data = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { readAt: new Date() } }, { new: true },
    );
    if (!data) return res.status(404).json({ message: "Notification not found" });
    req.app.get("io")?.to(String(req.user.id)).emit("notifications_updated");
    res.json({ data });
  } catch {
    res.status(500).json({ message: "Failed to mark notification read" });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await Notification.updateMany({ recipient: req.user.id, readAt: null }, { $set: { readAt: new Date() } });
    req.app.get("io")?.to(String(req.user.id)).emit("notifications_updated");
    res.json({ message: "Notifications marked as read" });
  } catch {
    res.status(500).json({ message: "Failed to mark notifications read" });
  }
}
