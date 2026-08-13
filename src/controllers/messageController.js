import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { encrypt, decrypt } from "../utils/cryptoUtils.js";

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "_id fullName email")
      .populate("item", "_id title type images")
      .sort({ lastMessageAt: -1 })
      .lean();

    const decryptedConversations = conversations.map(c => ({
      ...c,
      lastMessage: decrypt(c.lastMessage)
    }));

    res.json({ data: decryptedConversations });
  } catch (error) {
    res.status(500).json({ message: "Failed to load conversations", error: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "_id fullName")
      .sort({ createdAt: 1 })
      .lean();

    const decryptedMessages = messages.map(m => ({
      ...m,
      text: decrypt(m.text)
    }));

    res.json({ data: decryptedMessages });
  } catch (error) {
    res.status(500).json({ message: "Failed to load messages", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const encryptedText = encrypt(text.trim());

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: encryptedText,
    });

    conversation.lastMessage = encryptedText;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate("sender", "_id fullName");
    const populatedObj = populated.toObject();
    populatedObj.text = decrypt(populatedObj.text);
    
    const io = req.app.get("io");

    if (io) {
      io.to(String(conversation._id)).emit("message_received", { data: populatedObj });
    }

    res.status(201).json({ data: populatedObj });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

export const startConversation = async (req, res) => {
  try {
    const { recipientId, itemId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }

    if (String(recipientId) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] },
      item: itemId || null,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId],
        item: itemId || null,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "_id fullName email")
      .populate("item", "_id title type images");

    res.status(201).json({ data: populated });
  } catch (error) {
    res.status(500).json({ message: "Failed to start conversation", error: error.message });
  }
};
