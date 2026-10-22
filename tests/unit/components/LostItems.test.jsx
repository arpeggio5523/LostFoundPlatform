vi.mock("../../../src/components/NotificationButton", () => ({ default: () => null }));
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import LostItemsPage from "../../../src/pages/LostItemsPage";

import { apiFetch } from "../../../src/services/apiClient";
import { getAuthUser, isAdmin } from "../../../src/services/authState";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../src/services/apiClient", () => ({
  buildApiUrl: vi.fn(),
  apiFetch: vi.fn(),
}));

vi.mock("../../../src/services/authState", () => ({
  getAuthUser: vi.fn(),
  clearAuth: vi.fn(),
  isAdmin: vi.fn(),
}));

vi.mock("../../../src/context/ThemeContext", () => ({
  useTheme: () => ({
    resetTheme: vi.fn(),
  }),
}));

vi.mock("../../../src/components/Sidebar", () => ({
  default: () => (
    <div data-testid="sidebar">
      Sidebar
    </div>
  ),
}));

// Mock ItemCard so we only test LostItemsPage
vi.mock("../../../src/components/ItemCard", () => ({
  default: ({ item }) => (
    <div data-testid="item-card">
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <p>{item.location}</p>
      <p>{item.date}</p>
      <p>{item.category}</p>
      <p>{item.status}</p>
      <p>{item.user}</p>
    </div>
  ),
}));

const sampleItems = [
  {
    _id: "item1",
    title: "Lost Wallet",
    description: "Black leather wallet lost near the library.",
    location: "Universiti Malaya (UM)",
    date: "2026-08-30",
    category: "Accessories",
    status: "Approved",
    user: "John Doe",
    reportedBy: "user1",
    type: "Lost",
    images: ["https://example.com/wallet.jpg"],
  },
  {
    _id: "item2",
    title: "Lost Laptop",
    description: "Silver laptop lost in the student centre.",
    location: "Taylor's University",
    date: "2026-08-29",
    category: "Electronics",
    status: "Matched",
    user: "Jane Doe",
    reportedBy: "user2",
    type: "Lost",
    images: [],
  },
];

const renderPage = () => {
  return render(
    <MemoryRouter>
      <LostItemsPage />
    </MemoryRouter>
  );
};

describe("LostItemsPage - Viewing and Filtering", () => {

  beforeEach(() => {
    vi.clearAllMocks();

    getAuthUser.mockReturnValue({
      id: "user123",
    });

    isAdmin.mockReturnValue(false);

    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: sampleItems,
      }),
    });
  });

  // 1. View lost items
  it("displays the lost items list", async () => {
    renderPage();

    expect(
      await screen.findByText("Lost Wallet")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Lost Laptop")
    ).toBeInTheDocument();

    expect(
      screen.getAllByTestId("item-card")
    ).toHaveLength(2);
  });

  // 2. View item information
  it("displays the required information for each lost item", async () => {
    renderPage();

    const cards = await screen.findAllByTestId("item-card");

    expect(cards).toHaveLength(2);

    const firstCard = cards[0];

    expect(
      within(firstCard).getByText("Lost Wallet")
    ).toBeInTheDocument();

    expect(
      within(firstCard).getByText(
        "Black leather wallet lost near the library."
      )
    ).toBeInTheDocument();

    expect(
      within(firstCard).getByText(
        "Universiti Malaya (UM)"
      )
    ).toBeInTheDocument();

    expect(
      within(firstCard).getByText("Accessories")
    ).toBeInTheDocument();

    expect(
      within(firstCard).getByText("Approved")
    ).toBeInTheDocument();

    expect(
      within(firstCard).getByText("John Doe")
    ).toBeInTheDocument();
  });

  // 3. Fetch lost items
  it("fetches lost items from the API", async () => {
    renderPage();

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/items?type=Lost"
      );
    });
  });

  // 4. Display newly fetched items
  it("displays newly fetched lost items", async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            ...sampleItems[0],
            _id: "newItem",
            title: "Newly Lost Phone",
          },
        ],
      }),
    });

    renderPage();

    expect(
      await screen.findByText("Newly Lost Phone")
    ).toBeInTheDocument();
  });

  // 5. Search filtering
  it("filters lost items when searching by title or description", async () => {
    renderPage();

    await screen.findByText("Lost Wallet");

    const searchInput = screen.getByPlaceholderText(
      "Search items..."
    );

    fireEvent.change(searchInput, {
      target: { value: "Wallet" },
    });

    expect(
      screen.getByText("Lost Wallet")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Lost Laptop")
    ).not.toBeInTheDocument();
  });

  // 6. Category filtering
  it("filters lost items by category", async () => {
    renderPage();

    await screen.findByText("Lost Wallet");

    const categorySelect = screen.getAllByRole("combobox")[0];

    fireEvent.change(categorySelect, {
      target: { value: "Electronics" },
    });

    expect(
      screen.getByText("Lost Laptop")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Lost Wallet")
    ).not.toBeInTheDocument();
  });

  // 7. Location and status filtering
  it("filters lost items by location and status", async () => {
    renderPage();

    await screen.findByText("Lost Wallet");

    const selects = screen.getAllByRole("combobox");

    // Location
    fireEvent.change(selects[1], {
      target: {
        value: "Taylor's University",
      },
    });

    expect(
      screen.getByText("Lost Laptop")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Lost Wallet")
    ).not.toBeInTheDocument();

    // Status
    fireEvent.change(selects[2], {
      target: {
        value: "Matched",
      },
    });

    expect(
      screen.getByText("Lost Laptop")
    ).toBeInTheDocument();
  });

  // 8. Clear filters
  it("clears active filters and displays all lost items", async () => {
    renderPage();

    await screen.findByText("Lost Wallet");

    const searchInput = screen.getByPlaceholderText(
      "Search items..."
    );

    fireEvent.change(searchInput, {
      target: { value: "Wallet" },
    });

    expect(
      screen.queryByText("Lost Laptop")
    ).not.toBeInTheDocument();

    const clearButton = screen.getByRole("button", {
      name: /clear/i,
    });

    fireEvent.click(clearButton);

    expect(
      screen.getByText("Lost Wallet")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Lost Laptop")
    ).toBeInTheDocument();
  });
});