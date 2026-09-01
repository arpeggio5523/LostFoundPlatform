import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ReportLostItemPage from "../../../src/pages/ReportLostItemPage";

vi.mock("../../../src/services/apiClient", () => ({
  apiFetch: vi.fn(),
  buildApiUrl: vi.fn((path) => path),
  authHeaders: vi.fn((extra = {}) => ({
    Authorization: "Bearer fake-token",
    ...extra
  }))
}));

vi.mock("../../../src/services/authState", () => ({
  getAuthUser: vi.fn(),
  isAdmin: vi.fn()
}));

const showToastMock = vi.fn();
vi.mock("../../../src/context/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock })
}));

vi.mock("../../../src/components/LocationTagField", () => ({
  default: () => <div data-testid="location-tag-field-stub" />
}));

import { apiFetch } from "../../../src/services/apiClient";
import { getAuthUser, isAdmin } from "../../../src/services/authState";

const existingItem = {
  _id: "item-123",
  title: "Blue Umbrella",
  description: "Left in the library on level 2",
  category: "Accessories",
  color: "Blue",
  distMark: "Small tear near the handle",
  location: "Universiti Malaya (UM)",
  exactLocation: "Level 2 study area",
  date: "2026-08-01T00:00:00.000Z",
  status: "Approved",
  user: "Ruchith",
  images: [],
  reportLocation: {
    type: "Point",
    coordinates: [101.6544, 3.1201],
    formattedAddress: "UM Library"
  }
};

const renderEditPage = (editId = "item-123") => {
  return render(
    <MemoryRouter initialEntries={[`/report-lost?edit=${editId}`]}>
      <Routes>
        <Route path="/report-lost" element={<ReportLostItemPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ReportLostItemPage — edit mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAdmin.mockReturnValue(false);
    getAuthUser.mockReturnValue({ id: "user-1", fullName: "Ruchith" });
    apiFetch.mockImplementation(async (url, options) => {
      // GET on mount (no options passed for the fetch-existing-item call)
      if (!options) {
        return { ok: true, json: async () => ({ data: existingItem }) };
      }
      if (options.method === "PUT") {
        return { ok: true, json: async () => ({ data: existingItem }) };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  // AC3: existing post information is pre-filled
  it("pre-fills the form with the existing item data", async () => {
    renderEditPage();

    expect(
      await screen.findByDisplayValue("Blue Umbrella")
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Left in the library on level 2")
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Small tear near the handle")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Level 2 study area")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-08-01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Accessories")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Universiti Malaya (UM)")
    ).toBeInTheDocument();

    // Heading reflects edit mode
    expect(
      screen.getByRole("heading", { name: /edit lost item/i })
    ).toBeInTheDocument();
  });

  // AC4: valid edits are saved successfully
  it("saves successfully when valid changes are submitted", async () => {
    renderEditPage();

    const titleInput = await screen.findByDisplayValue("Blue Umbrella");
    fireEvent.change(titleInput, {
      target: { value: "Blue Umbrella (found near stairwell)" }
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/items/item-123",
        expect.objectContaining({ method: "PUT" })
      );
    });

    const putCall = apiFetch.mock.calls.find(
      ([, opts]) => opts?.method === "PUT"
    );
    const body = JSON.parse(putCall[1].body);
    expect(body.title).toBe("Blue Umbrella (found near stairwell)");

    expect(showToastMock).toHaveBeenCalledWith(
      "Item updated successfully!",
      "success"
    );
  });

  // AC5: removing required information shows validation errors
  it("shows a validation error when the title is cleared", async () => {
    renderEditPage();

    const titleInput = await screen.findByDisplayValue("Blue Umbrella");
    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText("Item title is required.")
    ).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("shows a validation error when the description is cleared", async () => {
    renderEditPage();

    const descriptionInput = await screen.findByDisplayValue(
      "Left in the library on level 2"
    );
    fireEvent.change(descriptionInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText("Description is required.")
    ).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("shows a validation error when the date is cleared", async () => {
    renderEditPage();

    const dateInput = await screen.findByDisplayValue("2026-08-01");
    fireEvent.change(dateInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText("Please select a date.")
    ).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("surfaces the server error message when the update request fails", async () => {
    apiFetch.mockImplementation(async (url, options) => {
      if (!options) {
        return { ok: true, json: async () => ({ data: existingItem }) };
      }
      if (options.method === "PUT") {
        return {
          ok: false,
          json: async () => ({ message: "Failed to update item" })
        };
      }
      return { ok: true, json: async () => ({}) };
    });

    renderEditPage();
    await screen.findByDisplayValue("Blue Umbrella");
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText("Failed to update item")
    ).toBeInTheDocument();
    expect(showToastMock).not.toHaveBeenCalled();
  });

  it("blocks saving with an authentication error if no user is logged in", async () => {
    getAuthUser.mockReturnValue(null);

    renderEditPage();
    await screen.findByDisplayValue("Blue Umbrella");
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText(/not authenticated\. please log in\./i)
    ).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "PUT" })
    );
  });
});
