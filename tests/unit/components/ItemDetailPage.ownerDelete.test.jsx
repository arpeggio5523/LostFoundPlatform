import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ItemDetailPage from "../../../src/pages/ItemDetailPage";

const authState = vi.hoisted(() => ({ owner: true, admin: false }));

vi.mock("../../../src/services/authState", async (importOriginal) => {
  const actual = await importOriginal();
  return {
  isOwner: vi.fn((item) => typeof item?.isOwner === "boolean" ? actual.isOwner(item) : authState.owner),
  isAdmin: vi.fn(() => authState.admin),
  canEditItem: vi.fn(() => authState.owner),
  getCurrentUserId: vi.fn(() => "owner-1"),
  };
});

vi.mock("../../../src/services/apiClient", () => ({
  getToken: vi.fn(() => "user-token"),
  authHeaders: vi.fn(() => ({ Authorization: "Bearer user-token" })),
  apiFetch: vi.fn(),
}));

const showToastMock = vi.fn();
vi.mock("../../../src/context/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));
vi.mock("../../../src/components/Sidebar", () => ({ default: () => <div /> }));
vi.mock("../../../src/components/NotificationButton", () => ({ default: () => null }));
vi.mock("../../../src/components/LocationMap", () => ({ default: () => <div /> }));
vi.mock("../../../src/components/QRcode", () => ({ default: () => null }));
vi.mock("../../../src/components/StatusBadge", () => ({
  default: ({ status }) => <span>{status}</span>,
}));

import { apiFetch } from "../../../src/services/apiClient";

const item = {
  _id: "owner-item-1",
  title: "Owner's lost backpack",
  description: "A backpack reported by its owner.",
  location: "Universiti Malaya (UM)",
  category: "Bag & Backpacks",
  status: "Approved",
  type: "Lost",
  user: "Owner User",
  reportedBy: "owner-1",
  date: "2026-08-16T00:00:00.000Z",
  reportLocation: { type: "Point", coordinates: [101.65, 3.12] },
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/item/owner-item-1"]}>
    <Routes>
      <Route path="/item/:id" element={<ItemDetailPage />} />
      <Route path="/lost-items" element={<div>Lost items destination</div>} />
    </Routes>
  </MemoryRouter>,
);

describe("ItemDetailPage - ownership and admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.owner = true;
    authState.admin = false;
    apiFetch.mockImplementation(async (_url, options) => {
      if (options?.method === "DELETE") {
        return { ok: true, json: async () => ({ message: "Item deleted successfully." }) };
      }
      return { ok: true, json: async () => ({ data: item }) };
    });
  });

  it("shows all four admin actions in two full-width rows with border-only contact styling", async () => {
    authState.admin = true;
    authState.owner = false;
    renderPage();

    const toolbar = await screen.findByLabelText("Admin item actions");
    const statusRow = within(toolbar).getByLabelText("Status updates");
    const contactRow = within(toolbar).getByLabelText("Contact actions");
    expect(toolbar).toHaveClass("flex-col");
    expect(statusRow.nextElementSibling).toBe(contactRow);
    for (const row of [statusRow, contactRow]) {
      expect(row).toHaveClass("grid", "w-full", "grid-cols-2");
      expect(within(row).getAllByRole("button")).toHaveLength(2);
    }
    expect(within(statusRow).getByRole("button", { name: "Mark as matched" })).toBeInTheDocument();
    expect(within(statusRow).getByRole("button", { name: "Mark as returned" })).toBeInTheDocument();
    expect(within(contactRow).getByRole("button", { name: "Contact owner" })).toBeInTheDocument();
    expect(within(contactRow).getByRole("button", { name: "Chat" })).toBeInTheDocument();
    for (const button of within(contactRow).getAllByRole("button")) {
      expect(button).toHaveClass("border", "border-[color-mix(in_srgb,var(--color-brand)_20%,transparent)]", "bg-[var(--color-bg-surface)]", "text-[var(--color-text-primary)]");
      expect(button).not.toHaveClass("bg-[var(--color-brand-active-bg)]");
    }
    expect(screen.getAllByRole("button", { name: "Contact owner" })).toHaveLength(1);
  });

  it("hides the contact row when the admin owns the post", async () => {
    authState.admin = true;
    renderPage();
    const toolbar = await screen.findByLabelText("Admin item actions");
    expect(within(toolbar).getByLabelText("Status updates")).toBeInTheDocument();
    expect(within(toolbar).queryByLabelText("Contact actions")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Contact owner" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chat" })).not.toBeInTheDocument();
  });

  it("fills the status row with the remaining action after the admin marks an item as matched", async () => {
    authState.admin = true;
    authState.owner = false;
    apiFetch.mockImplementation(async (_url, options) => ({
      ok: true,
      json: async () => ({
        data: options?.method === "PUT" ? { ...item, status: "Matched" } : item,
        isOwner: false,
      }),
    }));
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Mark as matched" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Mark as matched" })).not.toBeInTheDocument());
    expect(apiFetch).toHaveBeenCalledWith("/api/items/owner-item-1/status", expect.objectContaining({
      method: "PUT", body: JSON.stringify({ status: "Matched" }),
    }));
    const statusRow = screen.getByLabelText("Status updates");
    expect(statusRow).toHaveClass("w-full", "grid-cols-1");
    expect(within(statusRow).getAllByRole("button")).toHaveLength(1);
    expect(within(statusRow).getByRole("button", { name: "Mark as returned" })).toBeEnabled();
    expect(screen.getByLabelText("Contact actions")).toBeInTheDocument();
  });

  it("shows Delete item to the regular user who owns the post", async () => {
    renderPage();

    expect(await screen.findByRole("button", { name: "Delete item" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Contact owner" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Chat with/ })).not.toBeInTheDocument();
  });

  it("hides contact actions when the API identifies an anonymous post as owned despite stale local identity", async () => {
    authState.owner = false;
    localStorage.setItem("user", JSON.stringify({ _id: "stale-user" }));
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ...item, user: "Anonymous" }, isOwner: true }),
    });
    renderPage();
    await screen.findByText("Owner's lost backpack");
    expect(screen.queryByRole("button", { name: "Contact owner" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Chat with/ })).not.toBeInTheDocument();
    localStorage.removeItem("user");
  });

  it("hides Delete item from a regular user who does not own the post", async () => {
    authState.owner = false;
    renderPage();

    await screen.findByText("Owner's lost backpack");
    expect(screen.queryByRole("button", { name: "Delete item" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contact owner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Chat with/ })).toBeInTheDocument();
  });

  it("does not delete the owner's post until confirmation", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Delete item" }));

    expect(screen.getByRole("heading", { name: "Delete Item" })).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      "/api/items/owner-item-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deletes the owner's post after confirmation", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Delete item" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete", exact: true }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith(
      "/api/items/owner-item-1",
      expect.objectContaining({
        method: "DELETE",
        headers: { Authorization: "Bearer user-token" },
      }),
    ));
    expect(showToastMock).toHaveBeenCalledWith("Item deleted successfully.", "success");
    expect(await screen.findByText("Lost items destination")).toBeInTheDocument();
  });
});
