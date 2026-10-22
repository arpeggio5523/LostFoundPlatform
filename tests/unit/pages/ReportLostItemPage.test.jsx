import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { apiFetch } from "../../../src/services/apiClient";
import ReportLostItemPage from "../../../src/pages/ReportLostItemPage";

// Mock API functions
vi.mock("../../../src/services/apiClient", () => ({
  authHeaders: vi.fn(() => ({})),
  buildApiUrl: vi.fn((url) => url),
  apiFetch: vi.fn(),
}));

// Mock navigation
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

// Mock authentication
vi.mock("../../../src/services/authState", () => ({
  getAuthUser: () => ({ fullName: "Test User" }),
  isAdmin: () => false,
}));

// Mock toast notification
vi.mock("../../../src/context/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock map location field
vi.mock("../../../src/components/Locationtagfield", () => ({
  default: ({ onChange }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          type: "Point",
          coordinates: [101.7, 3.1],
          formattedAddress: "Test location",
        })
      }
    >
      Set test map location
    </button>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Keep the API request pending until the test resolves it.
function createDeferredPromise() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// Fill in required fields so submission passes validation.
async function renderValidReportForm() {
  const user = userEvent.setup();

  render(<ReportLostItemPage />);

  await user.type(
    screen.getByPlaceholderText("e.g., iPhone with Blue Case"),
    "Test phone"
  );

  await user.type(
    screen.getByPlaceholderText("Describe the item you lost..."),
    "Black phone with a blue case"
  );

  const selects = screen.getAllByRole("combobox");

  await user.selectOptions(selects[0], "Electronics");
  await user.selectOptions(selects[1], "Sunway University");

  fireEvent.change(
    document.querySelector('input[type="date"]'),
    { target: { value: "2026-10-22" } }
  );

  await user.click(
    screen.getByRole("button", {
      name: "Set test map location",
    })
  );
}

describe("ReportLostItemPage duplicate submission", () => {
  it("sends only one API request after five rapid submit clicks", async () => {
    const request = createDeferredPromise();

    // Keep the first API request pending during repeated clicks.
    apiFetch.mockReturnValue(request.promise);

    await renderValidReportForm();

    const submitButton = screen.getByRole("button", {
      name: "Submit Report",
    });

    // Simulate five rapid clicks.
    for (let i = 0; i < 5; i++) {
      fireEvent.click(submitButton);
    }

    // Wait for the first API request to start.
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(1);
    });

    // Verify that the repeated clicks did not create more requests.
    expect(apiFetch).toHaveBeenCalledTimes(1);

    // Complete the pending request successfully.
    request.resolve({
      ok: true,
      json: async () => ({
        message: "Report submitted successfully",
      }),
    });

    // Verify successful submission navigates to the lost-items page.
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/lost-items");
    });

    // Confirm there was still only one API request.
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });
});
