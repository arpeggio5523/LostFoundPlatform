import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  startConversation,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.post("/conversations/start", startConversation);

export default router;
