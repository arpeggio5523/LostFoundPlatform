import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MessagesPage from "../../../src/pages/MessagesPage";
import { fetchConversations, fetchMessages, sendMessage } from "../../../src/services/messagesApi";

const { toast, socket } = vi.hoisted(() => ({
  toast: vi.fn(),
  socket: { connected: true, on: vi.fn(), off: vi.fn(), emit: vi.fn() },
}));
vi.mock("../../../src/services/messagesApi", () => ({ fetchConversations: vi.fn(), fetchMessages: vi.fn(), sendMessage: vi.fn() }));
vi.mock("../../../src/services/authState", () => ({ getAuthUser: () => ({ _id: "me" }), getCurrentUserId: () => "me" }));
vi.mock("../../../src/context/SocketContext", () => ({ useSocket: () => socket }));
vi.mock("../../../src/context/ToastContext", () => ({ useToast: () => ({ showToast: toast }) }));
vi.mock("../../../src/components/Sidebar", () => ({ default: () => null }));
vi.mock("../../../src/components/NavBar2", () => ({ default: () => null }));

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.clearAllMocks();
  fetchConversations.mockResolvedValue({ data: [{ _id: "conv-1", participants: [{ _id: "other", fullName: "Other user" }] }] });
  fetchMessages.mockResolvedValue({ data: [] });
  sendMessage.mockImplementation(async (conversation, text, image) => ({ data: { _id: "sent", conversation, sender: "me", text, image } }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function openConversation() {
  render(<MemoryRouter><MessagesPage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: /Other user/ }));
  await waitFor(() => expect(fetchMessages).toHaveBeenCalledWith("conv-1"));
}

async function attachImage() {
  fireEvent.change(screen.getByLabelText("Choose image attachment"), {
    target: { files: [new File(["image"], "photo.png", { type: "image/png" })] },
  });
  await screen.findByAltText("Selected attachment");
}

test("paperclip opens the picker and an image-only message sends over HTTP even with a live socket", async () => {
  await openConversation();
  const picker = screen.getByLabelText("Choose image attachment");
  const click = vi.spyOn(picker, "click");
  fireEvent.click(screen.getByRole("button", { name: "Attach image" }));
  expect(click).toHaveBeenCalled();
  await attachImage();
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(sendMessage).toHaveBeenCalledWith("conv-1", "", expect.stringContaining("data:image/png;base64,")));
  expect(await screen.findByAltText("Image attachment")).toBeInTheDocument();
  expect(screen.queryByAltText("Selected attachment")).not.toBeInTheDocument();
});

test("a selected image can be removed", async () => {
  await openConversation();
  await attachImage();
  fireEvent.click(screen.getByRole("button", { name: "Remove attachment" }));
  expect(screen.queryByAltText("Selected attachment")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
});

test("sends a caption and avoids duplicates when the live event arrives before the HTTP response", async () => {
  await openConversation();
  await attachImage();
  sendMessage.mockImplementation(async (conversation, text, image) => {
    const data = { _id: "sent", conversation, sender: "me", text, image };
    const handler = socket.on.mock.calls.findLast(([event]) => event === "message_received")[1];
    handler({ data });
    return { data };
  });
  fireEvent.change(screen.getByPlaceholderText("Type a message..."), { target: { value: "Here is my photo" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(sendMessage).toHaveBeenCalledWith("conv-1", "Here is my photo", expect.any(String)));
  await waitFor(() => expect(screen.queryByAltText("Selected attachment")).not.toBeInTheDocument());
  expect(screen.getAllByAltText("Image attachment")).toHaveLength(1);
});

test("failed sends preserve the attachment for retry", async () => {
  await openConversation();
  await attachImage();
  sendMessage.mockRejectedValue(new Error("Upload failed"));
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(toast).toHaveBeenCalledWith("Upload failed", "error"));
  expect(screen.getByAltText("Selected attachment")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
});

test("conversation outages display an error instead of an empty inbox", async () => {
  fetchConversations.mockRejectedValue(new Error("Server temporarily unavailable"));
  render(<MemoryRouter><MessagesPage /></MemoryRouter>);
  expect(await screen.findByRole("alert")).toHaveTextContent("Server temporarily unavailable");
  expect(screen.queryByText("No conversations found")).not.toBeInTheDocument();
});

test("message loading outages display an error", async () => {
  fetchMessages.mockRejectedValue(new Error("Unable to load messages"));
  await openConversation();
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load messages");
});

test("failed text sends preserve the draft and release the send button", async () => {
  await openConversation();
  sendMessage.mockRejectedValue(new Error("Unable to connect to the server"));
  fireEvent.change(screen.getByPlaceholderText("Type a message..."), { target: { value: "Unsent draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(toast).toHaveBeenCalledWith("Unable to connect to the server", "error"));
  expect(screen.getByPlaceholderText("Type a message...")).toHaveValue("Unsent draft");
  expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
});

test("polling outages preserve the conversation and recover without reloading", async () => {
  const interval = vi.spyOn(globalThis, "setInterval");
  try {
    await openConversation();
    const poll = interval.mock.calls.findLast(([, delay]) => delay === 3000)[0];
    fetchConversations.mockRejectedValue(new Error("Connection lost"));
    fetchMessages.mockRejectedValue(new Error("Message service unavailable"));
    poll();
    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(2));
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    fetchConversations.mockResolvedValue({ data: [{ _id: "conv-1", participants: [{ _id: "other", fullName: "Other user" }] }] });
    fetchMessages.mockResolvedValue({ data: [] });
    poll();
    await waitFor(() => expect(screen.queryAllByRole("alert")).toHaveLength(0));
  } finally {
    interval.mockRestore();
  }
});

test("rejects unsupported files", async () => {
  await openConversation();
  fireEvent.change(screen.getByLabelText("Choose image attachment"), { target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] } });
  expect(toast).toHaveBeenCalledWith(expect.stringContaining("JPEG"), "error");
  expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
});
