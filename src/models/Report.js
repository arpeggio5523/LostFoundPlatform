import mongoose from "mongoose";

export const REPORT_CATEGORIES = [
  "Harassment",
  "Spam",
  "Scam or Fraud",
  "Inappropriate Content",
  "Impersonation",
  "Other",
];

export const REPORT_STATUSES = ["Pending", "Resolved", "Rejected"];

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    category: { type: String, enum: REPORT_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    /** Screenshot data URL, AES-256-GCM encrypted at rest like message images. */
    evidenceImage: { type: String, required: true },
    status: { type: String, enum: REPORT_STATUSES, default: "Pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    adminNote: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, status: 1 });

const Report = mongoose.model("Report", reportSchema);
export default Report;
