import React from "react";
import { render, waitFor } from "@testing-library/react";
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
});
