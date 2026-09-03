import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import FoundItemsPage from "../../../src/pages/FoundItemsPage";

import { apiFetch } from "../../../src/services/apiClient";
import {
  getAuthUser,
  clearAuth,
  isAdmin,
} from "../../../src/services/authState";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock API
vi.mock("../../../src/services/apiClient", () => ({
  buildApiUrl: vi.fn(),
  apiFetch: vi.fn(),
}));

// Mock authentication
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

// Mock Sidebar
vi.mock("../../../src/components/Sidebar", () => ({
  default: ({ isCollapsed, setIsCollapsed }) => (
    <div data-testid="sidebar">
      <button onClick={() => setIsCollapsed(!isCollapsed)}>
        Toggle Sidebar
      </button>
    </div>
  ),
}));

// Mock ItemCard
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
    title: "Found Keys",
    description: "Two silver keys found near the cafeteria.",
    location: "Universiti Malaya (UM)",
    date: "2026-08-30",
    category: "Keys",
    status: "Approved",
    user: "John Doe",
    reportedBy: "user1",
    type: "Found",
    images: ["https://example.com/keys.jpg"],
  },
  {
    _id: "item2",
    title: "Black Backpack",
    description: "Black backpack found in the student centre.",
    location: "Taylor's University",
    date: "2026-08-29",
    category: "Bag & Backpacks",
    status: "Returned",
    user: "Jane Doe",
    reportedBy: "user2",
    type: "Found",
    images: [],
  },
];

// Helper function
const renderPage = () => {
  return render(
    <MemoryRouter>
      <FoundItemsPage />
    </MemoryRouter>
  );
};

// Tests
describe("FoundItemsPage", () => {

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

  // 1. Found item list display
  it("displays the found items list", async () => {
    renderPage();

    expect(await screen.findByText("Found Keys")).toBeInTheDocument();
    expect(screen.getByText("Black Backpack")).toBeInTheDocument();

    expect(screen.getAllByTestId("item-card")).toHaveLength(2);
  });

  // 2. Item information display
  it("displays the required information for each found item", async () => {
    renderPage();

    expect(await screen.findByText("Found Keys")).toBeInTheDocument();

    expect(
      screen.getByText("Two silver keys found near the cafeteria.")
    ).toBeInTheDocument();

    expect(
        screen.getAllByText("Universiti Malaya (UM)").length
        ).toBeGreaterThanOrEqual(1);

    expect(
        screen.getAllByText("Keys").length
        ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getAllByText("Approved").length
    ).toBeGreaterThanOrEqual(1);


    expect(
      screen.getByText("John Doe")
    ).toBeInTheDocument();
  });

  // 3. Fetch found items
  it("fetches found items from the API", async () => {
    renderPage();

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/items?type=Found"
      );
    });
  });

  // 4. Latest items are displayed
  it("displays newly fetched found items", async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            ...sampleItems[0],
            _id: "newItem",
            title: "Newly Found Phone",
          },
        ],
      }),
    });

    renderPage();

    expect(
      await screen.findByText("Newly Found Phone")
    ).toBeInTheDocument();
  });

  // 5. No items available
  it("displays a message when no found items are available", async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
      }),
    });

    renderPage();

    expect(
      await screen.findByText("No items match your filters.")
    ).toBeInTheDocument();
  });

  // 6. Search filtering
  it("filters items when the user searches by title", async () => {
    renderPage();

    expect(await screen.findByText("Found Keys")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search items...");

    fireEvent.change(searchInput, {
      target: { value: "Keys" },
    });

    expect(screen.getByText("Found Keys")).toBeInTheDocument();
    expect(screen.queryByText("Black Backpack")).not.toBeInTheDocument();
  });

  // 7. Category filtering
  it("filters items by category", async () => {
    renderPage();

    await screen.findByText("Found Keys");

    const selects = screen.getAllByRole("combobox");

    fireEvent.change(selects[0], {
      target: { value: "Keys" },
    });

    expect(screen.getByText("Found Keys")).toBeInTheDocument();
    expect(screen.queryByText("Black Backpack")).not.toBeInTheDocument();
  });

  // 8. Location filtering
  it("filters items by location", async () => {
    renderPage();

    await screen.findByText("Found Keys");

    const selects = screen.getAllByRole("combobox");

    fireEvent.change(selects[1], {
      target: {
        value: "Taylor's University",
      },
    });

    expect(screen.getByText("Black Backpack")).toBeInTheDocument();
    expect(screen.queryByText("Found Keys")).not.toBeInTheDocument();
  });

  // 9. Clear filters
  it("clears active filters when Clear is clicked", async () => {
    renderPage();

    await screen.findByText("Found Keys");

    const searchInput = screen.getByPlaceholderText("Search items...");

    fireEvent.change(searchInput, {
      target: { value: "Keys" },
    });

    expect(screen.queryByText("Black Backpack")).not.toBeInTheDocument();

    const clearButton = screen.getByRole("button", {
      name: /clear/i,
    });

    fireEvent.click(clearButton);

    expect(screen.getByText("Found Keys")).toBeInTheDocument();
    expect(screen.getByText("Black Backpack")).toBeInTheDocument();
  });

  // 10. Report Found Item navigation
  it("navigates to the report found item page", async () => {
    renderPage();

    const reportButton = screen.getByRole("button", {
      name: /report found item/i,
    });

    fireEvent.click(reportButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/report-found"
    );
  });


  // 11. Logout
  it("logs out the user and navigates to login", async () => {
    renderPage();

    const logoutButton = screen.getByRole("button", {
      name: /logout/i,
    });

    fireEvent.click(logoutButton);

    expect(clearAuth).toHaveBeenCalled();

    expect(mockNavigate).toHaveBeenCalledWith(
      "/login",
      { replace: true }
    );
  });

  // 12. Unauthenticated user
  it("redirects unauthenticated users to the login page", async () => {
    getAuthUser.mockReturnValue(null);

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/login",
        { replace: true }
      );
    });
  });

  // 13. API error
  it("displays an error message when fetching items fails", async () => {
    apiFetch.mockRejectedValueOnce(
      new Error("Network error")
    );

    renderPage();

    expect(
      await screen.findByText("Error: Network error")
    ).toBeInTheDocument();
  });

  it("displays loading state while items are being fetched", async () => {
    let resolveRequest;

    apiFetch.mockReturnValueOnce(
      new Promise(resolve => {
        resolveRequest = resolve;
      })
    );

    renderPage();

    expect(
      screen.getByText("Loading items...")
    ).toBeInTheDocument();

    resolveRequest({
      ok: true,
      json: async () => ({
        data: sampleItems,
      }),
    });

    await waitFor(() => {
      expect(
        screen.getByText("Found Keys")
      ).toBeInTheDocument();
    });
  });

});
