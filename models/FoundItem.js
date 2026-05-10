import mongoose from "mongoose";

const foundItemImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number }
  },
  { _id: false }
);

const foundItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    marks: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    dateFound: { type: Date, required: true },
    images: {
      type: [foundItemImageSchema],
      validate: {
        validator: value => Array.isArray(value) && value.length > 0,
        message: "At least one image is required."
      }
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const FoundItem = mongoose.model("FoundItem", foundItemSchema);

export default FoundItem;