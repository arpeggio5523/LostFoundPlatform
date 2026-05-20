import express from "express";
import Item from "../models/Item.js";
import { 
  updateItemStatus,
  getApprovedFoundItems
} from "../controllers/itemController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/found-items", getApprovedFoundItems);

router.post("/", async (req, res) => {
  try {
    const newItem = new Item({
      title: req.body.title,
      description: req.body.description,
      distMark: req.body.distMark,
      color: req.body.color,
      location: req.body.location,
      date: req.body.date,
      category: req.body.category,
      status: req.body.status, // optional (defaults to Pending)
      itemType: req.body.itemType, // required (Lost or Found)
      user: req.body.user,
      images: req.body.images,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SEED DATABASE
router.post("/seed", async (req, res) => {
  try {
    const sampleItems = [
      {
        title: "Black Wallet",
        description: "Leather wallet with student ID card inside",
        distMark: "Small scratch on the back",
        color: "Black",
        location: "Library",
        date: new Date(),
        category: "Accessories",
        status: "Pending",
        user: "System",
        images: [],
      },

      {
        title: "Blue Backpack",
        description: "Nike backpack containing books and charger",
        distMark: "Torn left strap",
        color: "Blue",
        location: "Cafeteria",
        date: new Date(),
        category: "Bag & Backpacks",
        status: "Pending",
        user: "System",
        images: [],
      },

      {
        title: "MacBook Pro",
        description: "Silver MacBook with stickers on cover",
        distMark: "Apple logo sticker",
        color: "Silver",
        location: "Computer Lab",
        date: new Date(),
        category: "Electronics",
        status: "Pending",
        user: "System",
        images: [],
      },
    ];

    const inserted = await Item.insertMany(sampleItems);
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:itemId/status", updateItemStatus);

export default router;