import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["message", "approved", "rejected", "edited", "deleted", "matched", "returned", "pending_review"], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  readAt: { type: Date, default: null },
}, { timestamps: true });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, readAt: 1 });

export default mongoose.model("Notification", notificationSchema);
