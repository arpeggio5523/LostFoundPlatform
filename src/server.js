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
import notificationRoutes from "./routes/notificationRoutes.js";
import { notifyMessageRecipients } from "./services/notificationService.js";
import connectDB from "./config/db.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { verifyAccessToken } from "./utils/authSession.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import { encrypt, decrypt } from "./utils/cryptoUtils.js";
import userRoutes from "./routes/userRoutes.js";
import languageRoutes from "./routes/languageRoutes.js";
import { maskUserForViewer } from "./utils/privacy.js";
import { sendNewMessageNotificationEmail } from "./utils/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "../dist");
const distIndexPath = path.join(distPath, "index.html");

const publicFrontendUrl = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173";
const allowedOrigins = publicFrontendUrl
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

  socket.on("join_conversation", async (conversationId) => {
    if (conversationId) {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user.id,
        });

        if (conversation) {
          socket.join(String(conversationId));
        }
      } catch (error) {
        // Silent catch to prevent leaking valid vs invalid IDs
      }
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

      const encryptedText = encrypt(text.trim());

      const message = await Message.create({
        conversation: conversation._id,
        sender: socket.user.id,
        text: encryptedText,
      });

      conversation.lastMessage = encryptedText;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      // const populated = await Message.findById(message._id).populate("sender", "_id fullName");
      // const populatedObj = populated.toObject();
      // populatedObj.text = decrypt(populatedObj.text);

      // conversation.participants.forEach((participantId) => {
      //   io.to(String(participantId)).emit("message_received", { data: populatedObj });
      // });
      // socket.emit("message_sent", { data: populatedObj });
    
      const populated = await Message.findById(message._id).populate(
        "sender",
        "_id fullName privacyMode"
      );
      const populatedObj = populated.toObject();
      populatedObj.text = decrypt(populatedObj.text);
      await notifyMessageRecipients(io, conversation, populatedObj.sender);

      // Each participant gets their own masked view — sender sees their own
      // real name, everyone else sees "Anonymous" if privacyMode is on.
      conversation.participants.forEach((participantId) => {
        const viewForParticipant = {
          ...populatedObj,
          sender: maskUserForViewer(populatedObj.sender, participantId),
        };
        io.to(String(participantId)).emit("message_received", { data: viewForParticipant });
      });

      const sender = await import("./models/User.js").then((mod) => mod.default.findById(socket.user.id, "_id fullName email").lean());
      const offlineRecipients = [];

      for (const participantId of conversation.participants) {
        if (String(participantId) === String(socket.user.id)) continue;
        const recipientId = String(participantId);

        if (io.sockets.adapter.rooms.has(recipientId)) {
          continue;
        }

        const recipient = await import("./models/User.js").then((mod) => mod.default.findById(recipientId, "_id fullName email").lean());
        if (!recipient?.email) continue;

        offlineRecipients.push({
          recipientId,
          recipient,
        });
      }

      for (const { recipient } of offlineRecipients) {
        await sendNewMessageNotificationEmail({
          toEmail: recipient.email,
          recipientName: recipient.fullName,
          senderName: sender?.fullName || "Someone",
          messageText: text.trim(),
          itemTitle: conversation.item ? "your item" : "your item",
          conversationUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/messages`,
        });
      }

      socket.emit("message_sent", {
        data: {
          ...populatedObj,
          sender: maskUserForViewer(populatedObj.sender, socket.user.id),
        },
      });
    } catch (error) {
      socket.emit("message_error", { message: error.message });
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/language", languageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve Vite build in production
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (!fs.existsSync(distIndexPath)) {
    return res.status(200).send("Backend running. Run npm run build to serve Vite app.");
  }
  res.sendFile(distIndexPath);
});

const startServer = async () => {
    const key = process.env.MESSAGE_ENCRYPTION_KEY;
    if (!key || key.length !== 64 || !/^[0-9a-fA-F]+$/.test(key)) {
        console.warn("\n==========================================================");
        console.warn("⚠️  WARNING: MESSAGE_ENCRYPTION_KEY is missing or invalid!");
        console.warn("⚠️  It must be a 64-character hex string (32 bytes).");
        console.warn("⚠️  Direct messaging will fall back to plaintext mode.");
        console.warn("⚠️  Add it to your .env file to enable secure encryption.");
        console.warn("==========================================================\n");
    }

    try {
        await connectDB();
        server.listen(PORT, () => {
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
