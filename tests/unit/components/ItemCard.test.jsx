import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";

import ItemCard from "../../../src/components/ItemCard";

import { getCurrentUserId } from "../../../src/services/authState";

// Mock navigation
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock auth service
vi.mock("../../../src/services/authState", () => ({
  getCurrentUserId: vi.fn(),
}));

// Mock StatusBadge
vi.mock("../../../src/components/StatusBadge", () => ({
  default: ({ status }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

// Mock QRIcon
vi.mock("../../../src/components/QRIcon", () => ({
  default: ({ onClick }) => (
    <button
      data-testid="qr-icon-btn"
      onClick={onClick}
    >
      QR
    </button>
  ),
}));

// Mock NoImagePlaceholder
vi.mock("../../../src/components/NoImagePlaceHolder", () => ({
  default: () => (
    <div data-testid="no-image-placeholder">
      No Image
    </div>
  ),
}));

// Mock QRCodeModal
vi.mock("../../../src/components/QRcode", () => ({
  default: ({ isOpen, onClose, item }) =>
    isOpen ? (
      <div data-testid="qr-code-modal">
        <p>QR for {item.title}</p>

        <button onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null,
}));

describe("ItemCard", () => {
  const mockNavigate = vi.fn();

  const sampleItem = {
    _id: "item123",
    title: "Found Keys",
    description:
      "Keychain with two silver keys found near cafeteria.",
    location: "Student Center",
    date: "10/12/2026",
    category: "Keys",
    status: "Approved",
    user: "John Doe",
    reportedBy: "user456",
    image: "https://example.com/keys.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    getCurrentUserId.mockReturnValue("user456");
  });

  const renderItemCard = (item = sampleItem, props = {}) => {
    return render(
      <MemoryRouter>
        <ItemCard
          item={item}
          dateLabel="Found on:"
          {...props}
        />
      </MemoryRouter>
    );
  };


  // Each item displays key information
  it("displays the found item name", () => {
    renderItemCard();

    expect(
      screen.getByText("Found Keys")
    ).toBeInTheDocument();
  });

  it("displays the item description", () => {
    renderItemCard();

    expect(
      screen.getByText(
        "Keychain with two silver keys found near cafeteria."
      )
    ).toBeInTheDocument();
  });

  it("displays the item location", () => {
    renderItemCard();

    expect(
      screen.getByText("Student Center")
    ).toBeInTheDocument();
  });

  it("displays the date found", () => {
    renderItemCard();

    expect(
      screen.getByText("Found on: 10/12/2026")
    ).toBeInTheDocument();
  });

  it("displays the item category", () => {
    renderItemCard();

    expect(
      screen.getByText("Keys")
    ).toBeInTheDocument();
  });

  it("displays the item status", () => {
    renderItemCard();

    expect(
      screen.getByTestId("status-badge")
    ).toHaveTextContent("Approved");
  });

  it("displays the reporter name", () => {
    renderItemCard();

    expect(
      screen.getByText("By John Doe")
    ).toBeInTheDocument();
  });

  it("displays the item image when an image exists", () => {
    renderItemCard();

    const image = screen.getByRole("img", {
      name: "Found Keys",
    });

    expect(image).toBeInTheDocument();

    expect(image).toHaveAttribute(
      "src",
      "https://example.com/keys.jpg"
    );
  });

  it("displays the placeholder when no image exists", () => {
    const itemWithoutImage = {
      ...sampleItem,
      image: null,
    };

    renderItemCard(itemWithoutImage);

    expect(
      screen.getByTestId("no-image-placeholder")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("img")
    ).not.toBeInTheDocument();
  });

  // NAVIGATION
  it("navigates to the item details page when clicked", async () => {
    const user = userEvent.setup();

    renderItemCard();

    await user.click(
      screen.getByText("Found Keys")
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/item/item123"
    );
  });

  it("includes returnTo when provided", async () => {
    const user = userEvent.setup();

    renderItemCard(sampleItem, {
      returnTo: "/found-items",
    });

    await user.click(
      screen.getByText("Found Keys")
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/item/item123?returnTo=%2Ffound-items"
    );
  });

  // QR CODE
  it("does not display the QR modal initially", () => {
    renderItemCard();

    expect(
      screen.queryByTestId("qr-code-modal")
    ).not.toBeInTheDocument();
  });

  it("opens the QR modal when QR icon is clicked", async () => {
    const user = userEvent.setup();

    renderItemCard();

    await user.click(
      screen.getByTestId("qr-icon-btn")
    );

    expect(
      screen.getByTestId("qr-code-modal")
    ).toBeInTheDocument();
  });

  it("does not navigate when QR icon is clicked", async () => {
    const user = userEvent.setup();

    renderItemCard();

    await user.click(
      screen.getByTestId("qr-icon-btn")
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("closes the QR modal", async () => {
    const user = userEvent.setup();

    renderItemCard();

    await user.click(
      screen.getByTestId("qr-icon-btn")
    );

    await user.click(
      screen.getByText("Close Modal")
    );

    expect(
      screen.queryByTestId("qr-code-modal")
    ).not.toBeInTheDocument();
  });
});