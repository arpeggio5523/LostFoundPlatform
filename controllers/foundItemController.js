import FoundItem from "../models/FoundItem.js";

function normalizeImages(images) {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images
      .map(image => {
        if (typeof image === "string") {
          return { url: image };
        }

        if (image && typeof image === "object" && image.url) {
          return {
            url: image.url,
            filename: image.filename,
            mimetype: image.mimetype,
            size: image.size
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (typeof images === "string") {
    return [{ url: images }];
  }

  return [];
}

export async function createFoundItem(req, res) {
  try {
    const {
      title,
      description,
      category,
      color,
      marks,
      location,
      dateFound,
      images,
      status
    } = req.body;

    const normalizedImages = normalizeImages(images);

    const missingFields = [];
    if (!title || !String(title).trim()) missingFields.push("title");
    if (!description || !String(description).trim()) missingFields.push("description");
    if (!category || !String(category).trim()) missingFields.push("category");
    if (!location || !String(location).trim()) missingFields.push("location");
    if (!dateFound || !String(dateFound).trim()) missingFields.push("dateFound");
    if (normalizedImages.length === 0) missingFields.push("images");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields.",
        missingFields
      });
    }

    const foundItem = await FoundItem.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      color: color ? String(color).trim() : "",
      marks: marks ? String(marks).trim() : "",
      location: String(location).trim(),
      dateFound,
      images: normalizedImages,
      status: status || undefined
    });

    return res.status(201).json({
      message: "Found item created successfully.",
      foundItem
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create found item.",
      error: error.message
    });
  }
}

export async function listFoundItems(req, res) {
  try {
    const foundItems = await FoundItem.find().sort({ createdAt: -1 });

    return res.status(200).json({
      foundItems
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch found items.",
      error: error.message
    });
  }
}

export async function getFoundItem(req, res) {
  try {
    const { id } = req.params;

    const foundItem = await FoundItem.findById(id);

    if (!foundItem) {
      return res.status(404).json({
        message: "Found item not found."
      });
    }

    return res.status(200).json({
      foundItem
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch found item.",
      error: error.message
    });
  }
}