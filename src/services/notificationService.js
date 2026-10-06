import Notification from "../models/Notification.js";
import { maskUserForViewer } from "../utils/privacy.js";

export async function createNotification(io, fields) {
  const notification = await Notification.create(fields);
  io?.to(String(fields.recipient)).emit("notification_received", { data: notification });
  return notification;
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
  if (item.status === previousStatus || !["Approved", "Rejected"].includes(item.status)) return;
  await createNotification(io, {
    recipient: item.reportedBy?._id || item.reportedBy,
    type: item.status.toLowerCase(),
    title: `Report ${item.status.toLowerCase()}`,
    body: `Your report "${item.title}" was ${item.status.toLowerCase()} by an administrator.`,
    item: item._id,
  });
}
