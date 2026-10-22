import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { maskUserForViewer } from "../utils/privacy.js";

export async function createNotification(io, fields) {
  const notification = await Notification.create(fields);
  io?.to(String(fields.recipient)).emit("notification_received", { data: notification });
  return notification;
}

export async function notifyAdminsOfPendingReport(io, item) {
  if (item.status !== "Pending") return;
  const admins = await User.find({ role: "Admin" }).select("_id").lean();
  await Promise.all(admins.map((admin) => createNotification(io, {
    recipient: admin._id,
    type: "pending_review",
    title: "Report awaiting review",
    body: `A new ${item.type.toLowerCase()} item report "${item.title}" needs review.`,
    item: item._id,
  })));
}

export async function notifyMessageRecipients(io, conversation, sender) {
  await Promise.all(conversation.participants
    .filter((id) => String(id) !== String(sender._id))
    .map((recipient) => createNotification(io, {
      recipient,
      type: "message",
      title: "New message",
      body: `${maskUserForViewer(sender, recipient).fullName || "Someone"} sent you a message.`,
      conversation: conversation._id,
      item: conversation.item || undefined,
    })));
}

export async function notifyModeration(io, item, previousStatus) {
  if (item.status === previousStatus || !["Approved", "Rejected", "Matched", "Returned"].includes(item.status)) return;
  await createNotification(io, {
    recipient: item.reportedBy?._id || item.reportedBy,
    type: item.status.toLowerCase(),
    title: `Report ${item.status.toLowerCase()}`,
    body: `Your report "${item.title}" was ${item.status.toLowerCase()} by an administrator.`,
    item: item._id,
  });
}

export async function notifyReportChange(io, item, action, previousStatus) {
  // A status change during an edit gets one specific notification.
  if (action === "edited" && item.status !== previousStatus &&
      ["Approved", "Rejected", "Matched", "Returned"].includes(item.status)) {
    return notifyModeration(io, item, previousStatus);
  }
  await createNotification(io, {
    recipient: item.reportedBy?._id || item.reportedBy,
    type: action,
    title: `Report ${action}`,
    body: `Your report "${item.title}" was ${action} by an administrator.`,
    // Deleted reports no longer have a destination to open.
    ...(action === "deleted" ? {} : { item: item._id }),
  });
}
