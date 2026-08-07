import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import itemsRouter from "./routes/ItemRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import connectDB from "./config/db.js";
import { verifyAccessToken } from "./utils/authSession.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "../dist");
const distIndexPath = path.join(distPath, "index.html");

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO on top of the existing HTTP server
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});

app.set("io", io);

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.auth?.accessToken ||
    socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const payload = verifyAccessToken(token);
    socket.user = { id: payload.sub || payload.id, ...payload };
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.join(String(socket.user.id));

  socket.on("join_conversation", (conversationId) => {
    if (conversationId) {
      socket.join(String(conversationId));
    }
  });

  socket.on("leave_conversation", (conversationId) => {
    if (conversationId) {
      socket.leave(String(conversationId));
    }
  });

  socket.on("send_message", async ({ conversationId, text }) => {
    if (!conversationId || !text?.trim()) {
      return;
    }

    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user.id,
      });

      if (!conversation) {
        return;
      }

      const message = await Message.create({
        conversation: conversation._id,
        sender: socket.user.id,
        text: text.trim(),
      });

      conversation.lastMessage = text.trim();
      conversation.lastMessageAt = new Date();
      await conversation.save();

      const populated = await Message.findById(message._id).populate("sender", "_id fullName");
      io.to(String(conversation._id)).emit("message_received", { data: populated });
      socket.emit("message_sent", { data: populated });
    } catch (error) {
      socket.emit("message_error", { message: error.message });
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRouter);
app.use("/api/messages", messageRoutes);

// Serve Vite build in production
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (!fs.existsSync(distIndexPath)) {
    return res.status(200).send("Backend running. Run npm run build to serve Vite app.");
  }
  res.sendFile(distIndexPath);
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
    startServer();
}

export { app, server, startServer, io };
