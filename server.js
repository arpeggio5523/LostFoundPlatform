import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "./models/User.js";
import foundItemsRouter from "./routes/foundItems.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");
const distIndexPath = path.join(distPath, "index.html");

// MongoDB connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/fit3170db";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from localhost on any port during development
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.static(distPath));
app.use("/api/found-items", foundItemsRouter);

// Test route to create and fetch a user
app.get("/api/test-mongo", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "MongoDB is not connected. Start MongoDB or set MONGO_URI."
      });
    }
    let user = await User.findOne({ email: "test@example.com" });
    if (!user) {
      user = await User.create({ name: "Test User", email: "test@example.com" });
    }
    res.json({ message: "MongoDB connected and working!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  if (!fs.existsSync(distIndexPath)) {
    return res.status(200).send("Set up done (backend). Run npm run build to serve the Vite app here.");
  }
  res.sendFile(distIndexPath);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
