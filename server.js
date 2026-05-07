import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/User.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js"; 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is up and running! Visit /api/users for data.");
});

app.use("/api/users", userRoutes);

const startServer = async () => {
    try {
        await connectDB(); // Ensure this finishes before starting the app
        app.listen(PORT, () => {
            console.log("Server running and DB connected!");
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer();