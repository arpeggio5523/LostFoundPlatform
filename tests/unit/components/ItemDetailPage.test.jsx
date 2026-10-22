vi.mock("../../../src/components/NotificationButton", () => ({ default: () => null }));
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ItemDetailPage from "../../../src/pages/ItemDetailPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useParams: () => ({ id: "qr-item-123" }),
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: "/item/qr-item-123",
      search: "?source=qr",
    }),
    useSearchParams: () => [
      {
        get: vi.fn(),
      },
    ],
  };
});

vi.mock("../../../src/services/apiClient", () => ({
  authHeaders: vi.fn(() => ({})),
  apiFetch: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock("../../../src/services/authState", () => ({
  isOwner: vi.fn(),
  isAdmin: vi.fn(),
  canEditItem: vi.fn(),
  getCurrentUserId: vi.fn(),
}));

vi.mock("../../../src/context/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock("../../../src/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../../../src/components/LocationMap", () => ({
  default: () => <div data-testid="location-map">Map</div>,
}));

vi.mock("../../../src/components/ConfirmModal", () => ({
  default: () => null,
}));

vi.mock("../../../src/components/StatusBadge", () => ({
  default: ({ status }) => <span>{status}</span>,
}));

vi.mock("../../../src/components/QRcode", () => ({
  default: () => null,
}));

describe("ItemDetailPage QR redirects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated QR item visits to login and preserves the scanned URL", async () => {
    const { getToken, apiFetch } = await import("../../../src/services/apiClient");

    getToken.mockReturnValue(null);

    render(<ItemDetailPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/login?redirect=%2Fitem%2Fqr-item-123%3Fsource%3Dqr",
        { replace: true }
      );
    });

    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("automatically fetches and displays possible matches for the loaded item", async () => {
    const { getToken, apiFetch } = await import("../../../src/services/apiClient");
    const item = {
      _id: "qr-item-123",
      title: "Lost wallet",
      description: "Black leather wallet",
      type: "Lost",
      category: "Accessories",
      status: "Approved",
      location: "Campus",
      user: "Test User",
    };
    const match = {
      _id: "found-item-456",
      title: "Found black wallet",
      similarityScore: 0.92,
    };

    getToken.mockReturnValue("user-token");
    apiFetch.mockImplementation(async (url) => ({
      ok: true,
      json: async () => url === "/api/items/qr-item-123"
        ? { data: item }
        : { data: [match] },
    }));

    render(<ItemDetailPage />);

    expect(await screen.findByText("Found black wallet")).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/items/qr-item-123/similar?type=Found&limit=5",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("hides QR button for Pending items", async () => {
    const { getToken, apiFetch } = await import("../../../src/services/apiClient");

    getToken.mockReturnValue("user-token");

    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          _id: "qr-item-123",
          title: "Lost Wallet",
          description: "Black wallet",
          type: "Lost",
          category: "Accessories",
          status: "Pending",
          location: "Campus",
          user: "Test User",
        },
      }),
    });

    render(<ItemDetailPage />);

    await screen.findByText("Lost Wallet");

    expect(
      screen.queryByRole("button", { name: /view qr code/i })
    ).not.toBeInTheDocument();
  });

  it("hides QR button for Rejected items", async () => {
    const { getToken, apiFetch } = await import("../../../src/services/apiClient");

    getToken.mockReturnValue("user-token");

    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          _id: "qr-item-123",
          title: "Lost Wallet",
          description: "Black wallet",
          type: "Lost",
          category: "Accessories",
          status: "Rejected",
          location: "Campus",
          user: "Test User",
        },
      }),
    });

    render(<ItemDetailPage />);

    await screen.findByText("Lost Wallet");

    expect(
      screen.queryByRole("button", { name: /view qr code/i })
    ).not.toBeInTheDocument();
  });

  it("displays QR button for Approved items", async () => {
    const { getToken, apiFetch } = await import("../../../src/services/apiClient");

    getToken.mockReturnValue("user-token");

    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          _id: "qr-item-123",
          title: "Lost Wallet",
          description: "Black wallet",
          type: "Lost",
          category: "Accessories",
          status: "Approved",
          location: "Campus",
          user: "Test User",
        },
      }),
    });

    render(<ItemDetailPage />);

    expect(
      await screen.findByRole("button", { name: /view qr code/i })
    ).toBeInTheDocument();
  });
});
