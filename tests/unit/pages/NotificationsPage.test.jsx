import React from "react";
import { act, fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("../../../src/components/Sidebar", () => ({ default: () => null }));
vi.mock("../../../src/context/SocketContext", () => ({ useSocket: () => null }));
vi.mock("../../../src/services/authState", () => ({ getAuthUser: () => ({ id: "me" }) }));
vi.mock("../../../src/services/apiClient", () => ({ apiFetch: vi.fn() }));

import NotificationsPage from "../../../src/pages/NotificationsPage";
import { apiFetch } from "../../../src/services/apiClient";

beforeEach(() => vi.clearAllMocks());
afterEach(() => { cleanup(); vi.useRealTimers(); });

const entries = [
  { _id: "unread", type: "message", title: "Unread message", body: "A new message", createdAt: new Date().toISOString(), readAt: null, conversation: "chat" },
  { _id: "read", type: "approved", title: "Read report", body: "Approved", createdAt: new Date().toISOString(), readAt: new Date().toISOString(), item: "item" },
];

test("switching All to Unread and back reuses the complete feed without fetching or loading", async () => {
  apiFetch.mockResolvedValue({ ok: true, json: async () => ({ data: entries, total: 2, unreadCount: 1 }) });
  render(<MemoryRouter><NotificationsPage /></MemoryRouter>);
  await screen.findByText("Read report");
  fireEvent.click(screen.getByRole("button", { name: /^Unread/ }));
  expect(screen.getByText("Unread message")).toBeInTheDocument();
  expect(screen.queryByText("Read report")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Loading notifications")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "All", exact: true }));
  expect(screen.getByText("Read report")).toBeInTheDocument();
  expect(apiFetch).toHaveBeenCalledTimes(1);
});

test("manual refresh fetches fresh data without replacing the list with a loading skeleton", async () => {
  apiFetch.mockResolvedValue({ ok: true, json: async () => ({ data: entries, total: 2, unreadCount: 1 }) });
  render(<MemoryRouter><NotificationsPage /></MemoryRouter>);
  await screen.findByText("Read report");
  fireEvent.click(screen.getByRole("button", { name: "Refresh notifications" }));
  expect(screen.getByText("Read report")).toBeInTheDocument();
  expect(screen.queryByLabelText("Loading notifications")).not.toBeInTheDocument();
  await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(2));
});

test("does not periodically fetch while the page is idle", async () => {
  apiFetch.mockResolvedValue({ ok: true, json: async () => ({ data: entries, total: 2, unreadCount: 1 }) });
  render(<MemoryRouter><NotificationsPage /></MemoryRouter>);
  await screen.findByText("Read report");
  vi.useFakeTimers();
  await act(async () => { vi.advanceTimersByTime(120000); });
  expect(apiFetch).toHaveBeenCalledTimes(1);
});

test("fetches an uncached filter once when All contains only part of the history", async () => {
  apiFetch.mockImplementation(async (url) => ({ ok: true, json: async () => url.includes("filter=unread")
    ? { data: [entries[0]], total: 1, unreadCount: 1 }
    : { data: entries, total: 30, unreadCount: 1 } }));
  render(<MemoryRouter><NotificationsPage /></MemoryRouter>);
  await screen.findByText("Read report");
  fireEvent.click(screen.getByRole("button", { name: /^Unread/ }));
  await waitFor(() => expect(screen.queryByText("Read report")).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "All", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: /^Unread/ }));
  expect(apiFetch).toHaveBeenCalledTimes(2);
  expect(screen.queryByLabelText("Loading notifications")).not.toBeInTheDocument();
});
