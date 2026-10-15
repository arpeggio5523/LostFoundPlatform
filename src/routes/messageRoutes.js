import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  startConversation,
  translateMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(requireAuth);
router.post("/conversations/:conversationId/messages/:messageId/translate", translateMessage);

router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.post("/conversations/start", startConversation);

// quick server checks
router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

export default router;
