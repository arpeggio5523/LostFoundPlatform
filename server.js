import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "./models/User.js";
import foundItemsRouter from "./routes/foundItems.js";
import authRoutes from "./routes/authRoutes.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const distPath = path.join(__dirname, "dist");
const distIndexPath = path.join(distPath, "index.html");

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/fit3170db";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: function(origin, callback) {
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
app.use("/api/auth", authRoutes);

app.get("*", (req, res) => {
  if (!fs.existsSync(distIndexPath)) {
    return res.status(200).send("Backend running. Run npm run build to serve Vite app.");
  }
  res.sendFile(distIndexPath);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});