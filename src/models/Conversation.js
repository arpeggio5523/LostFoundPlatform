import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    /**
     * @description Stores AES-256-GCM encrypted ciphertext of the last message at rest.
     * Must be encrypted before saving and decrypted before sending to client.
     */
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
