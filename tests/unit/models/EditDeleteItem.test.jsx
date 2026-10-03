import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ItemDetailPage from "../../../src/pages/ItemDetailPage";

vi.mock("../../../src/services/authState", () => ({
  isOwner: vi.fn(),
  isAdmin: vi.fn(),
  canEditItem: vi.fn(),
  getCurrentUserId: vi.fn(() => "user-1")
}));

vi.mock("../../../src/services/apiClient", () => ({
  getToken: vi.fn(() => "fake-token"),
  authHeaders: vi.fn(() => ({ Authorization: "Bearer fake-token" })),
  apiFetch: vi.fn()
}));

const showToastMock = vi.fn();
vi.mock("../../../src/context/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock })
}));

vi.mock("../../../src/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar-stub" />
}));

vi.mock("../../../src/components/LocationMap", () => ({
  default: () => <div data-testid="location-map-stub" />
}));

vi.mock("../../../src/components/QRcode", () => ({
  default: () => null
}));

vi.mock("../../../src/components/StatusBadge", () => ({
  default: ({ status }) => <span>{status}</span>
}));

import { isOwner, isAdmin, canEditItem } from "../../../src/services/authState";
import { apiFetch } from "../../../src/services/apiClient";

const baseItem = {
  _id: "item-123",
  title: "Blue Umbrella",
  description: "Left in the library on level 2",
  location: "Universiti Malaya (UM)",
  category: "Accessories",
  color: "Blue",
  status: "Approved",
  type: "Lost",
  user: "owner@university.edu",
  reportedBy: "user-1",
  date: "2026-08-01T00:00:00.000Z",
  reportLocation: { type: "Point", coordinates: [101.65, 3.12] }
};

const renderItemDetail = (id = "item-123") => {
  return render(
    <MemoryRouter initialEntries={[`/item/${id}`]}>
      <Routes>
        <Route path="/item/:id" element={<ItemDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ItemDetailPage — Edit/Delete visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: baseItem })
    });
  });

  it("shows the Delete button to the item owner", async () => {
    isOwner.mockReturnValue(true);
    isAdmin.mockReturnValue(false);
    canEditItem.mockReturnValue(true);

    renderItemDetail();

    expect(
      await screen.findByRole("button", { name: /delete item/i })
    ).toBeInTheDocument();
  });

  it("shows the Edit button to an admin", async () => {
    isOwner.mockReturnValue(false);
    isAdmin.mockReturnValue(true);
    canEditItem.mockReturnValue(true);

    renderItemDetail();

    await screen.findByText("Blue Umbrella");
    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
  });

  it("does not show Edit to a non-admin owner (current intentional behavior)", async () => {
    isOwner.mockReturnValue(true);
    isAdmin.mockReturnValue(false);
    canEditItem.mockReturnValue(false);

    renderItemDetail();

    await screen.findByText("Blue Umbrella");
    expect(
      screen.queryByRole("button", { name: /^edit$/i })
    ).not.toBeInTheDocument();
  });

  it("does not show Edit or Delete to a user who is neither owner nor admin", async () => {
    isOwner.mockReturnValue(false);
    isAdmin.mockReturnValue(false);
    canEditItem.mockReturnValue(false);

    renderItemDetail();

    await screen.findByText("Blue Umbrella");
    expect(
      screen.queryByRole("button", { name: /delete item/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^edit$/i })
    ).not.toBeInTheDocument();
  });
});

describe("ItemDetailPage — deleting an item", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isOwner.mockReturnValue(true);
    isAdmin.mockReturnValue(false);
    canEditItem.mockReturnValue(true);
    apiFetch.mockImplementation(async (url, options) => {
      if (options?.method === "DELETE") {
        return { ok: true, json: async () => ({}) };
      }
      return { ok: true, json: async () => ({ data: baseItem }) };
    });
  });

  it("opens a confirmation dialog and does not delete until confirmed", async () => {
    renderItemDetail();

    fireEvent.click(
      await screen.findByRole("button", { name: /delete item/i })
    );

    expect(
      await screen.findByRole("heading", { name: /delete item/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /are you sure you want to delete this item\? this action cannot be undone/i
      )
    ).toBeInTheDocument();

    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("item-123"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("cancels without deleting when Cancel is clicked", async () => {
    renderItemDetail();

    fireEvent.click(
      await screen.findByRole("button", { name: /delete item/i })
    );
    await screen.findByRole("heading", { name: /delete item/i });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.queryByRole("heading", { name: /delete item/i })
    ).not.toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("item-123"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("deletes the item once the user confirms", async () => {
    renderItemDetail();

    fireEvent.click(
      await screen.findByRole("button", { name: /delete item/i })
    );
    fireEvent.click(await screen.findByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/items/item-123",
        expect.objectContaining({ method: "DELETE" })
      );
    });
    expect(showToastMock).toHaveBeenCalledWith(
      expect.stringMatching(/deleted successfully/i),
      "success"
    );
  });

  it("shows an error toast when deletion fails", async () => {
    apiFetch.mockImplementation(async (url, options) => {
      if (options?.method === "DELETE") {
        return { ok: false, json: async () => ({ message: "Not authorized" }) };
      }
      return { ok: true, json: async () => ({ data: baseItem }) };
    });

    renderItemDetail();

    fireEvent.click(
      await screen.findByRole("button", { name: /delete item/i })
    );
    fireEvent.click(await screen.findByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith("Not authorized", "error");
    });
  });
});
