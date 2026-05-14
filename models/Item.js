import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      maxlength: [100, "Title max length is 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description max length is 500 characters"],
    },

    distMark: {
      type: String,
      trim: true,
      maxlength: [200, "Distinctive mark max length is 200 characters"],
    },

    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color max length is 50 characters"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Electronics",
        "Accessories",
        "Bag & Backpacks",
        "Documents",
        "Keys",
        "Clothing",
        "Books",
        "Sports Equipment",
        "Jewelry",
        "Other",
      ],
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: [
          "Pending",
          "Approved",
          "Matched",
          "Returned",
        ],
        message:
          "Status must be one of [Pending, Approved, Matched, Returned]",
      },
      default: "Pending",
    },

    user: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },

    images: {
      type: [String],

      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },

        message: "Maximum 5 images allowed",
      },

      default: [],
    },

    item_id: {
      type: String,
      unique: true,
      sparse: true,
    },
  },

  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;