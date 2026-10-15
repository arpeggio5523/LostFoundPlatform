import { apiFetch } from "./apiClient";
import { getCurrentUserId } from "./authState";

// const USE_MOCKS = true; // ← flip to false once backend endpoints exist
const USE_MOCKS = false;
/* ---------------------------------------------------------------------- */
/* Mock data — matches the contract above field-for-field                 */
/* ---------------------------------------------------------------------- */

const ME = getCurrentUserId() || "mock-me";

const MOCK_USERS = {
  aisyah: { _id: "u1", fullName: "Aisyah Rahman", email: "aisyah@example.com" },
  marcus: { _id: "u2", fullName: "Marcus Tan", email: "marcus@example.com" },
  priya: { _id: "u3", fullName: "Priya Devi", email: "priya@example.com" },
};

let mockConversations = [
  {
    _id: "conv1",
    participants: [{ _id: ME, fullName: "You" }, MOCK_USERS.aisyah],
    item: { _id: "item1", title: "Found: Black iPhone 13", type: "Found", images: [] },
    lastMessage: "Yes, I can meet at KLCC tomorrow around 3pm",
    lastMessageAt: "2026-07-31T10:42:00.000Z",
  },
  {
    _id: "conv2",
    participants: [{ _id: ME, fullName: "You" }, MOCK_USERS.marcus],
    item: { _id: "item2", title: "Lost: Blue Backpack", type: "Lost", images: [] },
    lastMessage: "Thank you so much, really appreciate it!",
    lastMessageAt: "2026-07-30T09:00:00.000Z",
  },
  {
    _id: "conv3",
    participants: [{ _id: ME, fullName: "You" }, MOCK_USERS.priya],
    item: { _id: "item3", title: "Found: Student ID Card", type: "Found", images: [] },
    lastMessage: "Sure, here's a photo of the card",
    lastMessageAt: "2026-07-28T14:00:00.000Z",
  },
];

let mockMessages = {
  conv1: [
    { _id: "m1", conversation: "conv1", sender: MOCK_USERS.aisyah, text: "Hi! I think you found my phone near the LRT station?", createdAt: "2026-07-31T10:12:00.000Z" },
    { _id: "m2", conversation: "conv1", sender: { _id: ME, fullName: "You" }, text: "Yes! Black iPhone 13, cracked case, right?", createdAt: "2026-07-31T10:15:00.000Z" },
    { _id: "m3", conversation: "conv1", sender: MOCK_USERS.aisyah, text: "That's exactly it!! Can we arrange a pickup?", createdAt: "2026-07-31T10:20:00.000Z" },
    { _id: "m4", conversation: "conv1", sender: { _id: ME, fullName: "You" }, text: "Sure, I'm free tomorrow afternoon. Does KLCC work?", createdAt: "2026-07-31T10:38:00.000Z" },
    { _id: "m5", conversation: "conv1", sender: MOCK_USERS.aisyah, text: "Yes, I can meet at KLCC tomorrow around 3pm", createdAt: "2026-07-31T10:42:00.000Z" },
  ],
  conv2: [
    { _id: "m6", conversation: "conv2", sender: MOCK_USERS.marcus, text: "I saw your lost backpack post, I have it with me", createdAt: "2026-07-30T08:50:00.000Z" },
    { _id: "m7", conversation: "conv2", sender: { _id: ME, fullName: "You" }, text: "Thank you so much, really appreciate it!", createdAt: "2026-07-30T09:00:00.000Z" },
  ],
  conv3: [
    { _id: "m8", conversation: "conv3", sender: { _id: ME, fullName: "You" }, text: "Hi, is this the ID card you found near the library?", createdAt: "2026-07-28T13:50:00.000Z" },
    { _id: "m9", conversation: "conv3", sender: MOCK_USERS.priya, text: "Sure, here's a photo of the card", createdAt: "2026-07-28T14:00:00.000Z" },
  ],
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------------------------------------------------------------------- */
/* Public API — this is what components import and call                  */
/* ---------------------------------------------------------------------- */

export async function fetchConversations() {
  if (USE_MOCKS) {
    await delay();
    return { data: mockConversations };
  }
  const res = await apiFetch("/api/messages/conversations");
  return res.json();
}

export async function fetchMessages(conversationId) {
  if (USE_MOCKS) {
    await delay();
    return { data: mockMessages[conversationId] || [] };
  }
  const res = await apiFetch(`/api/messages/conversations/${conversationId}/messages`);
  return res.json();
}

export async function translateMessage(conversationId, messageId, targetLanguage) {
  const res = await apiFetch(`/api/messages/conversations/${conversationId}/messages/${messageId}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLanguage }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to translate message.");
  return data;
}

export async function sendMessage(conversationId, text, image = null) {
  if (USE_MOCKS) {
    await delay(150);
    const newMessage = {
      _id: `m${Date.now()}`,
      conversation: conversationId,
      sender: { _id: ME, fullName: "You" },
      text,
      image,
      createdAt: new Date().toISOString(),
    };
    mockMessages[conversationId] = [...(mockMessages[conversationId] || []), newMessage];
    mockConversations = mockConversations.map((c) =>
      c._id === conversationId
        ? { ...c, lastMessage: text || "Photo", lastMessageAt: newMessage.createdAt }
        : c
    );
    return { data: newMessage };
  }
  const res = await apiFetch(`/api/messages/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, image }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send message");
  return data;
}

export async function startConversation(recipientId, itemId) {
  if (USE_MOCKS) {
    await delay();
    const existing = mockConversations.find(
      (c) =>
        c.participants.some((p) => p._id === recipientId) &&
        (!itemId || c.item?._id === itemId)
    );
    if (existing) return { data: existing };

    const newConvo = {
      _id: `conv${Date.now()}`,
      participants: [{ _id: ME, fullName: "You" }, { _id: recipientId, fullName: "New Contact" }],
      item: itemId ? { _id: itemId, title: "Item", type: "Lost", images: [] } : undefined,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
    };
    mockConversations = [newConvo, ...mockConversations];
    mockMessages[newConvo._id] = [];
    return { data: newConvo };
  }
  const res = await apiFetch("/api/messages/conversations/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientId, itemId }),
  });
  return res.json();
}
