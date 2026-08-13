import mongoose from "mongoose";

const nonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title max length is 100 characters"],
      validate: {
        validator: nonEmptyString,
        message: "Title cannot be empty",
      },
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description max length is 500 characters"],
      validate: {
        validator: nonEmptyString,
        message: "Description cannot be empty",
      },
    },

    distMark: {
      type: String,
      trim: true,
      maxlength: [200, "Distinctive mark max length is 200 characters"],
      default: "",
    },

    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color max length is 50 characters"],
      default: "",
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      enum: {
        values: [
          "Universiti Malaya (UM)",
          "Universiti Kebangsaan Malaysia (UKM)",
          "Universiti Sains Malaysia (USM)",
          "Universiti Putra Malaysia (UPM) Central Library",
          "Universiti Teknologi Malaysia (UTM)",
          "Universiti Teknologi MARA (UiTM)",
          "Taylor's University",
          "Sunway University",
          "Multimedia University (MMU)",
        ],
        message: "Invalid location selected",
      },
      trim: true,
      minlength: [3, "Location must be at least 3 characters"],
      validate: {
        validator: nonEmptyString,
        message: "Location cannot be empty",
      },
    },

    exactLocation: {
      type: String,
      trim: true,
      maxlength: [200, "Exact location max length is 200 characters"],
      default: "",
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Date cannot be in the future",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
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
        message: "Invalid category selected",
      },
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: [
          "Lost",
          "Found",
          "Returned",
          "Pending",
          "Approved",
          "Matched",
        ],
        message:
          "Status must be one of [Lost, Found, Returned, Pending, Approved, Matched]",
      },
      default: "Approved",
    },

    user: {
      type: String,
      required: [true, "User is required"],
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
      trim: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
        // To match the name in the schema "User"
        ref: 'User',
        required: true
    },

    type: {
      type: String,
      required: true,
      enum: ["Lost", "Found"],
    },

    // MAPBOX GEOJSON
    reportLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: [true, "Map coordinates [longitude, latitude] are required"],
        validate: {
          validator: function (val) {
            if (!Array.isArray(val) || val.length !== 2) {
              return false;
            }
            const [longitude, latitude] = val;
            return Math.abs(longitude) <= 180 && Math.abs(latitude) <= 90;
          },
          message: "Coordinates must be in valid range",
        },
      },
      formattedAddress: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Spatial Indexing for MongoDB GeoJSON querying
itemSchema.index({ reportLocation: "2dsphere" });

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;