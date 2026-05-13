import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");
const distIndexPath = path.join(distPath, "index.html");

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.static(distPath));

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
