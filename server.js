import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js"; 
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
>>>>>>> server.js

app.get("/", (req, res) => {
    res.send("Server is up and running! Visit /api/auth for authentication.");
});

<<<<<<< server.js
app.use("/api/auth", authRoutes);

const startServer = async () => {
    try {
        await connectDB(); 
        app.listen(PORT, () => {
            console.log("Server running and DB connected!");
        });
    } catch (err) {
        console.error("Failed to start server:", err);
=======
// api route mount to port
app.use("/api/items", ItemRoutes);

// Test route to create and fetch a user
app.get("/api/test-mongo", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "MongoDB is not connected. Start MongoDB or set MONGO_URI."
      });
>>>>>>> server.js
    }
};

startServer();