import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ItemDetailPage from "../../../src/pages/ItemDetailPage";

vi.mock("../../../src/services/authState", () => ({
  isOwner: vi.fn(() => false),
  isAdmin: vi.fn(() => true),
  canEditItem: vi.fn(() => true),
  getCurrentUserId: vi.fn(() => "admin-1"),
}));

vi.mock("../../../src/services/apiClient", () => ({
  getToken: vi.fn(() => "admin-token"),
  authHeaders: vi.fn(() => ({ Authorization: "Bearer admin-token" })),
  apiFetch: vi.fn(),
}));

const showToastMock = vi.fn();
vi.mock("../../../src/context/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

vi.mock("../../../src/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar-stub" />,
}));
vi.mock("../../../src/components/LocationMap", () => ({
  default: () => <div data-testid="location-map-stub" />,
}));
vi.mock("../../../src/components/QRcode", () => ({ default: () => null }));
vi.mock("../../../src/components/StatusBadge", () => ({
  default: ({ status }) => <span>{status}</span>,
}));

import { apiFetch } from "../../../src/services/apiClient";

const item = {
  _id: "item-delete-1",
  title: "Post to delete",
  description: "An item post selected for removal.",
  location: "Universiti Malaya (UM)",
  category: "Other",
  color: "Black",
  status: "Rejected",
  type: "Lost",
  user: "Test User",
  reportedBy: "user-1",
  date: "2026-08-14T00:00:00.000Z",
  reportLocation: { type: "Point", coordinates: [101.65, 3.12] },
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/item/item-delete-1?returnTo=%2Fadmin-dashboard"]}>
    <Routes>
      <Route path="/item/:id" element={<ItemDetailPage />} />
      <Route path="/admin-dashboard" element={<div>Admin dashboard destination</div>} />
    </Routes>
  </MemoryRouter>,
);

describe("ItemDetailPage - admin delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetch.mockImplementation(async (_url, options) => {
      if (options?.method === "DELETE") {
        return { ok: true, json: async () => ({ message: "Item deleted successfully." }) };
      }
      return { ok: true, json: async () => ({ data: item }) };
    });
  });

  it("shows Delete item to an admin who does not own the post", async () => {
    renderPage();

    expect(await screen.findByRole("button", { name: "Delete item" })).toBeInTheDocument();
  });

  it("does not send a delete request before the admin confirms", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Delete item" }));

    expect(screen.getByRole("heading", { name: "Delete Item" })).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      "/api/items/item-delete-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deletes after confirmation and returns to the admin dashboard", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Delete item" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete", exact: true }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith(
      "/api/items/item-delete-1",
      expect.objectContaining({
        method: "DELETE",
        headers: { Authorization: "Bearer admin-token" },
      }),
    ));
    expect(showToastMock).toHaveBeenCalledWith("Item deleted successfully.", "success");
    expect(await screen.findByText("Admin dashboard destination")).toBeInTheDocument();
  });

  it("shows the API error and remains on the item when deletion fails", async () => {
    apiFetch.mockImplementation(async (_url, options) => {
      if (options?.method === "DELETE") {
        return { ok: false, json: async () => ({ message: "Delete was refused" }) };
      }
      return { ok: true, json: async () => ({ data: item }) };
    });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Delete item" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete", exact: true }));

    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith("Delete was refused", "error"));
    expect(screen.getByText("Post to delete")).toBeInTheDocument();
  });
});
