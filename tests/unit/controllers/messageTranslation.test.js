import { beforeEach, expect, it, vi } from "vitest";
vi.mock("../../../src/models/Conversation.js", () => ({ default: { findOne: vi.fn() } }));
vi.mock("../../../src/models/Message.js", () => ({ default: { findOne: vi.fn() } }));
vi.mock("../../../src/services/laraTranslate.js", () => ({ translateText: vi.fn() }));
vi.mock("../../../src/utils/cryptoUtils.js", () => ({ decrypt: vi.fn(), encrypt: vi.fn() }));
import Conversation from "../../../src/models/Conversation.js";
import Message from "../../../src/models/Message.js";
import { decrypt } from "../../../src/utils/cryptoUtils.js";
import { translateText } from "../../../src/services/laraTranslate.js";
import { translateMessage } from "../../../src/controllers/messageController.js";
const req = { params: { conversationId: "conv-1", messageId: "msg-1" }, user: { id: "viewer", preferredLanguage: "ms" }, body: { targetLanguage: "ms" } };
const response = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });
beforeEach(() => {
  vi.clearAllMocks();
  Conversation.findOne.mockResolvedValue({ _id: "conv-1" });
  Message.findOne.mockResolvedValue({ text: "encrypted-text" });
  decrypt.mockReturnValue("Hello");
  translateText.mockResolvedValue("Helo");
});
it("authorizes the viewer and translates decrypted text into the selected website language", async () => {
  const res = response();
  await translateMessage(req, res);
  expect(Conversation.findOne).toHaveBeenCalledWith({ _id: "conv-1", participants: "viewer" });
  expect(Message.findOne).toHaveBeenCalledWith({ _id: "msg-1", conversation: "conv-1" });
  expect(decrypt).toHaveBeenCalledWith("encrypted-text");
  expect(translateText).toHaveBeenCalledWith("Hello", "ms");
  expect(res.json).toHaveBeenCalledWith({ translatedText: "Helo", targetLanguage: "ms" });
});
it("does not send text to the translator for an unauthorized conversation", async () => {
  Conversation.findOne.mockResolvedValue(null);
  const res = response();
  await translateMessage(req, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(Message.findOne).not.toHaveBeenCalled();
  expect(translateText).not.toHaveBeenCalled();
});
it("rejects a message outside the conversation", async () => {
  Message.findOne.mockResolvedValue(null);
  const res = response();
  await translateMessage(req, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(translateText).not.toHaveBeenCalled();
});
it("defaults requests without a target to English", async () => {
  await translateMessage({ ...req, body: {} }, response());
  expect(translateText).toHaveBeenCalledWith("Hello", "en");
});
it.each([429, 503, 500])("handles provider error %s without leaking details", async (status) => {
  translateText.mockRejectedValue(Object.assign(new Error("secret provider details"), { status }));
  const res = response();
  await translateMessage(req, res);
  expect(res.status).toHaveBeenCalledWith(status === 500 ? 502 : status);
  expect(res.json).toHaveBeenCalledWith({ message: "Translation is temporarily unavailable. Please try again." });
});

it("rejects unsupported targets before calling the translator", async () => {
  const res = response();
  await translateMessage({ ...req, body: { targetLanguage: "invalid" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(translateText).not.toHaveBeenCalled();
});
