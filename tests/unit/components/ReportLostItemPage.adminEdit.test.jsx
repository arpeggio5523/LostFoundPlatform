import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ReportLostItemPage from "../../../src/pages/ReportLostItemPage";

vi.mock("../../../src/services/apiClient", () => ({
  apiFetch: vi.fn(),
  buildApiUrl: vi.fn((path) => path),
  authHeaders: vi.fn((extra = {}) => ({ Authorization: "Bearer admin-token", ...extra })),
}));

vi.mock("../../../src/services/authState", () => ({
  getAuthUser: vi.fn(() => ({ id: "admin-1", fullName: "Admin", role: "Admin" })),
  isAdmin: vi.fn(() => true),
}));

const showToastMock = vi.fn();
vi.mock("../../../src/context/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

vi.mock("../../../src/components/LocationTagField", () => ({
  default: () => <div data-testid="location-tag-field-stub" />,
}));

import { apiFetch } from "../../../src/services/apiClient";

const existingItem = {
  _id: "item-edit-1",
  title: "Original admin post",
  description: "Original description for the item.",
  category: "Accessories",
  color: "Blue",
  distMark: "Small scratch",
  location: "Universiti Malaya (UM)",
  exactLocation: "Main library",
  date: "2026-08-15T00:00:00.000Z",
  status: "Pending",
  user: "Test User",
  images: [],
  reportLocation: {
    type: "Point",
    coordinates: [101.6544, 3.1201],
    formattedAddress: "UM Library",
  },
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/report-lost?edit=item-edit-1&returnTo=%2Fadmin-dashboard"]}>
    <Routes>
      <Route path="/report-lost" element={<ReportLostItemPage />} />
      <Route path="/item/:id" element={<div>Updated item destination</div>} />
    </Routes>
  </MemoryRouter>,
);

describe("ReportLostItemPage - admin edit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetch.mockImplementation(async (_url, options) => {
      if (options?.method === "PUT") {
        return { ok: true, json: async () => ({ data: existingItem }) };
      }
      return { ok: true, json: async () => ({ data: existingItem }) };
    });
  });

  it("pre-fills the post and displays the admin-only status field", async () => {
    renderPage();

    expect(await screen.findByDisplayValue("Original admin post")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edit Lost Item" })).toBeInTheDocument();
    expect(document.querySelector('select[name="status"]')).toHaveValue("Pending");
  });

  it("sends the edited fields and status, then returns to the item", async () => {
    renderPage();
    fireEvent.change(await screen.findByDisplayValue("Original admin post"), {
      target: { value: "Edited by administrator" },
    });
    fireEvent.change(document.querySelector('select[name="status"]'), {
      target: { value: "Approved" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith(
      "/api/items/item-edit-1",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token",
          "Content-Type": "application/json",
        }),
      }),
    ));
    const [, request] = apiFetch.mock.calls.find(([, options]) => options?.method === "PUT");
    expect(JSON.parse(request.body)).toMatchObject({
      title: "Edited by administrator",
      status: "Approved",
    });
    expect(showToastMock).toHaveBeenCalledWith("Item updated successfully!", "success");
    expect(await screen.findByText("Updated item destination")).toBeInTheDocument();
  });

  it("does not submit when a required field is empty", async () => {
    renderPage();
    fireEvent.change(await screen.findByDisplayValue("Original admin post"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Item title is required.")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("displays the server error when the update fails", async () => {
    apiFetch.mockImplementation(async (_url, options) => {
      if (options?.method === "PUT") {
        return { ok: false, json: async () => ({ error: "Admin edit failed" }) };
      }
      return { ok: true, json: async () => ({ data: existingItem }) };
    });
    renderPage();
    await screen.findByDisplayValue("Original admin post");
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Admin edit failed")).toBeInTheDocument();
    expect(showToastMock).not.toHaveBeenCalled();
  });
});
