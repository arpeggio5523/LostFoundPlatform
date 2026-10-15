vi.mock("../../../src/services/notificationService.js", () => ({ notifyMessageRecipients: vi.fn(), notifyModeration: vi.fn() }));
/**
 * unit/controllers/messageController.test.js
 *
 * Covers the core "anonymous messaging" guarantees:
 *  - a private user's identity (name/email) is masked from other participants
 *    in conversations and messages, but visible to themselves
 *  - message text is encrypted before being stored, decrypted before being returned
 *  - a user cannot start a conversation with themselves
 *  - existing conversations are reused instead of duplicated
 *  - real-time delivery (socket) and offline email notification both receive
 *    a properly masked view of the sender, not the real identity
 *
 * privacy.js is used for real (not mocked) since correct masking is exactly
 * what this suite is verifying. cryptoUtils, the models, and emailService
 * are mocked so no real DB/network/crypto is involved.
 */

vi.mock("../../../src/models/Conversation.js");
vi.mock("../../../src/models/Message.js");
vi.mock("../../../src/models/User.js");
vi.mock("../../../src/utils/cryptoUtils.js");
vi.mock("../../../src/utils/emailService.js");

import Conversation from "../../../src/models/Conversation.js";
import Message from "../../../src/models/Message.js";
import User from "../../../src/models/User.js";
import { encrypt, decrypt } from "../../../src/utils/cryptoUtils.js";
import { sendNewMessageNotificationEmail } from "../../../src/utils/emailService.js";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  startConversation,
} from "../../../src/controllers/messageController.js";
import { makeQuery, makeRes } from "../../utils/Mongoosemocks.js";

const ME = "user-me";
const PRIVATE_OTHER = { _id: "user-private", fullName: "Private Person", email: "p@example.com", privacyMode: true };
const OPEN_OTHER = { _id: "user-open", fullName: "Open Person", email: "o@example.com", privacyMode: false };

beforeEach(() => {
  vi.clearAllMocks();
  decrypt.mockImplementation((ciphertext) => `decrypted:${ciphertext}`);
  encrypt.mockImplementation((plaintext) => `encrypted:${plaintext}`);
});

// ---------------------------------------------------------------------------
describe("getConversations", () => {
  test("masks each private participant and decrypts lastMessage", async () => {
    const req = { user: { id: ME } };
    const res = makeRes();

    Conversation.find.mockReturnValue(
      makeQuery([
        {
          _id: "conv-1",
          participants: [{ _id: ME, fullName: "Me", email: "me@example.com" }, PRIVATE_OTHER],
          item: { _id: "item-1", title: "Lost cat", images: [] },
          lastMessage: "cipher-abc",
        },
      ])
    );

    await getConversations(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    const [conversation] = res.body.data;
    expect(conversation.lastMessage).toBe("decrypted:cipher-abc");

    const maskedOther = conversation.participants.find((p) => p._id === "user-private");
    expect(maskedOther.fullName).toBe("Anonymous");
    expect(maskedOther.email).toBeUndefined();
    expect(maskedOther.privacyMode).toBeUndefined(); // flag itself never leaks

    const maskedMe = conversation.participants.find((p) => p._id === ME);
    expect(maskedMe.fullName).toBe("Me"); // viewer sees their own real identity
  });

  test("returns 500 on a DB error", async () => {
    const req = { user: { id: ME } };
    const res = makeRes();
    Conversation.find.mockImplementation(() => {
      throw new Error("DB down");
    });

    await getConversations(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ---------------------------------------------------------------------------
describe("getConversationMessages", () => {
  test("404s when the conversation doesn't exist or the user isn't a participant", async () => {
    const req = { user: { id: ME }, params: { conversationId: "conv-1" } };
    const res = makeRes();
    Conversation.findOne.mockResolvedValue(null);

    await getConversationMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns decrypted, masked messages for a valid participant", async () => {
    const req = { user: { id: ME }, params: { conversationId: "conv-1" } };
    const res = makeRes();

    Conversation.findOne.mockResolvedValue({ _id: "conv-1" });
    Message.find.mockReturnValue(
      makeQuery([
        { _id: "msg-1", sender: PRIVATE_OTHER, text: "cipher-1", image: "cipher-image" },
        { _id: "msg-2", sender: { _id: ME, fullName: "Me" }, text: "cipher-2" },
      ])
    );

    await getConversationMessages(req, res);

    const [msg1, msg2] = res.body.data;
    expect(msg1.text).toBe("decrypted:cipher-1");
    expect(msg1.image).toBe("decrypted:cipher-image");
    expect(msg1.sender.fullName).toBe("Anonymous"); // private sender hidden from viewer
    expect(msg2.sender.fullName).toBe("Me");
  });
});

// ---------------------------------------------------------------------------
describe("sendMessage", () => {
  const baseReq = (overrides = {}) => ({
    user: { id: ME },
    params: { conversationId: "conv-1" },
    body: { text: "Hello there" },
    app: { get: vi.fn().mockReturnValue(undefined) }, // no io by default
    ...overrides,
  });

  test.each(["data:image/svg+xml;base64,PHN2Zz4=", "not-an-image", {}, "data:image/png;base64," + "A".repeat(2800000)])("rejects invalid or oversized image attachments", async (image) => {
    const res = makeRes();
    await sendMessage(baseReq({ body: { image } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(Message.create).not.toHaveBeenCalled();
  });

  test("saves an encrypted image without a caption and broadcasts the decrypted image", async () => {
    const image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    const res = makeRes();
    const emit = vi.fn();
    const io = { to: vi.fn(() => ({ emit })) };
    const conversation = { _id: "conv-1", participants: [ME], save: vi.fn() };
    Conversation.findOne.mockResolvedValue(conversation);
    Message.create.mockResolvedValue({ _id: "image-message" });
    Message.findById.mockReturnValue({ populate: vi.fn().mockResolvedValue({
      toObject: () => ({ _id: "image-message", sender: { _id: ME }, text: "", image: `encrypted:${image}` }),
    }) });
    User.findById.mockReturnValue(makeQuery({ _id: ME }));
    decrypt.mockImplementation((value) => value.replace(/^encrypted:/, ""));

    await sendMessage(baseReq({ body: { image }, app: { get: () => io } }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(Message.create).toHaveBeenCalledWith(expect.objectContaining({ image: `encrypted:${image}` }));
    expect(conversation.lastMessage).toBe("encrypted:Photo");
    expect(res.body.data.image).toBe(image);
    expect(emit).toHaveBeenCalledWith("message_received", expect.objectContaining({ data: expect.objectContaining({ image }) }));
  });

  test("400s when text is missing or blank", async () => {
    const res = makeRes();
    await sendMessage(baseReq({ body: { text: "   " } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(Message.create).not.toHaveBeenCalled();
  });

  test("404s when the conversation doesn't exist or user isn't a participant", async () => {
    const res = makeRes();
    Conversation.findOne.mockResolvedValue(null);

    await sendMessage(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(Message.create).not.toHaveBeenCalled();
  });

  test("encrypts the message before storing, decrypts before responding, and updates conversation.lastMessage", async () => {
    const res = makeRes();
    const conversationDoc = {
      _id: "conv-1",
      participants: [ME, "user-private"],
      lastMessage: "",
      lastMessageAt: null,
      save: vi.fn().mockResolvedValue(true),
    };
    Conversation.findOne.mockResolvedValue(conversationDoc);
    // sendMessage always runs the "email offline recipients" loop when io is absent
    // (no io => everyone counts as offline), so Conversation.findById (used to look
    // up the item title for the notification email) must be mocked here too.
    Conversation.findById.mockReturnValue(makeQuery({ item: { title: "Lost cat" } }));
    Message.create.mockResolvedValue({ _id: "msg-1" });
    Message.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue({
        toObject: () => ({ _id: "msg-1", sender: { _id: ME, fullName: "Me", privacyMode: false }, text: "encrypted:Hello there" }),
      }),
    });
    User.findById.mockReturnValue(makeQuery({ _id: ME, fullName: "Me", email: "me@example.com" }));

    await sendMessage(baseReq(), res);

    expect(encrypt).toHaveBeenCalledWith("Hello there");
    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({ conversation: "conv-1", sender: ME, text: "encrypted:Hello there" })
    );
    expect(conversationDoc.lastMessage).toBe("encrypted:Hello there");
    expect(conversationDoc.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body.data.text).toBe("decrypted:encrypted:Hello there");
    expect(res.body.data.sender.fullName).toBe("Me"); // sender sees their own real name
  });

  test("emits a masked message to each conversation participant when io is available", async () => {
    const res = makeRes();
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    const io = { to, sockets: { adapter: { rooms: new Map() } } };

    const conversationDoc = {
      _id: "conv-1",
      participants: [ME, "user-private"],
      lastMessage: "",
      save: vi.fn().mockResolvedValue(true),
    };
    Conversation.findOne.mockResolvedValue(conversationDoc);
    Conversation.findById.mockReturnValue(makeQuery({ item: { title: "Lost cat" } }));
    Message.create.mockResolvedValue({ _id: "msg-1" });
    Message.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue({
        toObject: () => ({
          _id: "msg-1",
          sender: { _id: ME, fullName: "Me", privacyMode: true }, // sender IS private
          text: "encrypted:Hello there",
        }),
      }),
    });
    User.findById.mockReturnValue(makeQuery({ _id: ME, fullName: "Me", email: "me@example.com" }));

    await sendMessage(baseReq({ app: { get: vi.fn().mockReturnValue(io) } }), res);

    // one emit per participant (2 participants)
    expect(to).toHaveBeenCalledTimes(2);
    expect(to).toHaveBeenCalledWith(ME);
    expect(to).toHaveBeenCalledWith("user-private");

    // the emitted payload for the OTHER participant must mask the private sender
    const callForOther = to.mock.calls.findIndex((args) => args[0] === "user-private");
    const emittedToOther = emit.mock.calls[callForOther][1].data;
    expect(emittedToOther.sender.fullName).toBe("Anonymous");

    // the emitted payload for the sender themselves shows their real name
    const callForSelf = to.mock.calls.findIndex((args) => args[0] === ME);
    const emittedToSelf = emit.mock.calls[callForSelf][1].data;
    expect(emittedToSelf.sender.fullName).toBe("Me");
  });

  test("emails only offline recipients, not online ones", async () => {
    const res = makeRes();
    const onlineRoom = new Map([["user-online", true]]);
    const io = {
      to: vi.fn().mockReturnValue({ emit: vi.fn() }),
      sockets: { adapter: { rooms: onlineRoom } },
    };

    const conversationDoc = {
      _id: "conv-1",
      participants: [ME, "user-online", "user-offline"],
      lastMessage: "",
      save: vi.fn().mockResolvedValue(true),
    };
    Conversation.findOne.mockResolvedValue(conversationDoc);
    Conversation.findById.mockReturnValue(makeQuery({ item: { title: "Lost cat" } }));
    Message.create.mockResolvedValue({ _id: "msg-1" });
    Message.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue({
        toObject: () => ({ _id: "msg-1", sender: { _id: ME, fullName: "Me" }, text: "encrypted:Hi" }),
      }),
    });

    User.findById.mockImplementation((id) => {
      const users = {
        [ME]: { _id: ME, fullName: "Me", email: "me@example.com" },
        "user-online": { _id: "user-online", fullName: "Online User", email: "online@example.com" },
        "user-offline": { _id: "user-offline", fullName: "Offline User", email: "offline@example.com" },
      };
      return makeQuery(users[id]);
    });

    await sendMessage(baseReq({ app: { get: vi.fn().mockReturnValue(io) } }), res);

    expect(sendNewMessageNotificationEmail).toHaveBeenCalledTimes(1);
    expect(sendNewMessageNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ toEmail: "offline@example.com" })
    );
  });
});

// ---------------------------------------------------------------------------
describe("startConversation", () => {
  test("400s when recipientId is missing", async () => {
    const res = makeRes();
    await startConversation({ user: { id: ME }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400s when trying to message yourself", async () => {
    const res = makeRes();
    await startConversation({ user: { id: ME }, body: { recipientId: ME } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findById).not.toHaveBeenCalled();
  });

  test("404s when the recipient doesn't exist", async () => {
    const res = makeRes();
    User.findById.mockResolvedValue(null);

    await startConversation({ user: { id: ME }, body: { recipientId: "ghost" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("reuses an existing conversation instead of creating a duplicate", async () => {
    const res = makeRes();
    User.findById.mockResolvedValue({ _id: "user-open" });
    Conversation.findOne.mockResolvedValue({ _id: "conv-existing" });
    Conversation.findById.mockReturnValue(
      makeQuery({ _id: "conv-existing", participants: [{ _id: ME, fullName: "Me" }, OPEN_OTHER], item: null })
    );

    await startConversation({ user: { id: ME }, body: { recipientId: "user-open" } }, res);

    expect(Conversation.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body.data._id).toBe("conv-existing");
  });

  test("creates a new conversation and masks the private recipient in the response", async () => {
    const res = makeRes();
    User.findById.mockResolvedValue({ _id: "user-private" });
    Conversation.findOne.mockResolvedValue(null); // no existing conversation
    Conversation.create.mockResolvedValue({ _id: "conv-new" });
    Conversation.findById.mockReturnValue(
      makeQuery({ _id: "conv-new", participants: [{ _id: ME, fullName: "Me" }, PRIVATE_OTHER], item: null })
    );

    await startConversation({ user: { id: ME }, body: { recipientId: "user-private" } }, res);

    expect(Conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({ participants: [ME, "user-private"] })
    );
    const masked = res.body.data.participants.find((p) => p._id === "user-private");
    expect(masked.fullName).toBe("Anonymous");
  });
});
