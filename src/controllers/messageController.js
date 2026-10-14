import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { encrypt, decrypt } from "../utils/cryptoUtils.js";
import { maskUserForViewer } from "../utils/privacy.js";
import { sendNewMessageNotificationEmail } from "../utils/emailService.js";
import { validateMessageImage } from "../utils/messageAttachments.js";

const maskConversationForViewer = (conversation, viewerId) => ({
  ...conversation,
  participants: conversation.participants.map((participant) =>
    maskUserForViewer(participant, viewerId)
  ),
});

const maskMessageForViewer = (message, viewerId) => ({
  ...message,
  sender: maskUserForViewer(message.sender, viewerId),
});

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "_id fullName email privacyMode")
      .populate("item", "_id title type images")
      .sort({ lastMessageAt: -1 })
      .lean();

    const decryptedConversations = conversations.map((conversation) =>
      maskConversationForViewer(
        { ...conversation, lastMessage: decrypt(conversation.lastMessage) },
        req.user.id
      )
    );

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
      .populate("sender", "_id fullName privacyMode")
      .sort({ createdAt: 1 })
      .lean();

    const decryptedMessages = messages.map((message) =>
      maskMessageForViewer(
        { ...message, text: decrypt(message.text), image: message.image ? decrypt(message.image) : null },
        req.user.id
      )
    );

    res.json({ data: decryptedMessages });
  } catch (error) {
    res.status(500).json({ message: "Failed to load messages", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text = "", image } = req.body;

    if (typeof text !== "string") {
      return res.status(400).json({ message: "Message text must be a string" });
    }
    const imageError = validateMessageImage(image);
    if (imageError) return res.status(400).json({ message: imageError });
    if (!text.trim() && !image) {
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
      image: image ? encrypt(image) : null,
    });

    conversation.lastMessage = text.trim() ? encryptedText : encrypt("Photo");
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "_id fullName privacyMode"
    );
    const populatedObj = populated.toObject();
    populatedObj.text = decrypt(populatedObj.text);
    populatedObj.image = populatedObj.image ? decrypt(populatedObj.image) : null;
    
    const io = req.app.get("io");

    if (io) {
      conversation.participants.forEach((participantId) => {
        io.to(String(participantId)).emit("message_received", {
          data: maskMessageForViewer(populatedObj, participantId),
        });
      });
    }

    const sender = await User.findById(req.user.id, "_id fullName email").lean();
    const conversationUserIds = conversation.participants.filter(
      (participantId) => String(participantId) !== String(req.user.id)
    );

    for (const recipientId of conversationUserIds) {
      const isOnline = io?.sockets?.adapter?.rooms?.has(String(recipientId));
      if (isOnline) continue;

      const recipient = await User.findById(recipientId, "_id fullName email").lean();
      if (!recipient?.email) continue;

      const item = await Conversation.findById(conversation._id).populate("item", "_id title").lean();
      const itemTitle = item?.item?.title || "your item";
      const conversationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/messages`;

      await sendNewMessageNotificationEmail({
        toEmail: recipient.email,
        recipientName: recipient.fullName,
        senderName: sender?.fullName || "Someone",
        messageText: text.trim() || "Photo",
        itemTitle,
        conversationUrl,
      });
    }

    res.status(201).json({ data: maskMessageForViewer(populatedObj, req.user.id) });
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
      .populate("participants", "_id fullName email privacyMode")
      .populate("item", "_id title type images")
      .lean();

    res.status(201).json({ data: maskConversationForViewer(populated, req.user.id) });
  } catch (error) {
    res.status(500).json({ message: "Failed to start conversation", error: error.message });
  }
};
