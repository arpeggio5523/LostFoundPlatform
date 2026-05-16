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

app.get("/", (req, res) => {
    res.send("Server is up and running! Visit /api/auth for authentication.");
});

app.use("/api/auth", authRoutes);

const startServer = async () => {
    try {
        await connectDB(); 
        app.listen(PORT, () => {
            console.log("Server running and DB connected!");
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer();