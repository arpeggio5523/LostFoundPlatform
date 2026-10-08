import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "../../../src/context/LanguageContext";
import { createTranslator, LANGUAGE_STORAGE_KEY } from "../../../src/i18n/translations";
import SettingsPage from "../../../src/pages/SettingsPage";
import Dashboard from "../../../src/pages/Dashboard";
import ReportLostItemPage from "../../../src/pages/ReportLostItemPage";
import ReportFoundItemPage from "../../../src/pages/ReportFoundItemPage";
import FoundItemsPage from "../../../src/pages/FoundItemsPage";
import LostItemsPage from "../../../src/pages/LostItemsPage";

globalThis.React = React;

vi.mock("../../../src/context/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn(), resetTheme: vi.fn() }),
}));
vi.mock("../../../src/context/SocketContext", () => ({ useSocket: () => null }));
vi.mock("../../../src/context/ToastContext", () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock("../../../src/services/messagesApi", () => ({ fetchConversations: vi.fn(async () => ({ data: [] })) }));
vi.mock("../../../src/services/authState", () => ({
  getAuthUser: () => ({ id: "admin-1", role: "Admin", fullName: "Original Name" }),
  getCurrentUserId: () => "admin-1",
  isAdmin: () => true,
  clearAuth: vi.fn(),
  setAuthUser: vi.fn(),
}));
vi.mock("../../../src/services/apiClient", () => ({
  apiFetch: vi.fn(),
  buildApiUrl: (url) => url,
  authHeaders: (headers) => headers,
}));
vi.mock("../../../src/components/Locationtagfield", () => ({ default: () => null }));
vi.mock("../../../src/components/ImageSearchPanel", () => ({ default: () => null }));

import { apiFetch } from "../../../src/services/apiClient";

function LanguageControl() {
  const { language, setLanguage, t } = useLanguage();
  return <>
    <button onClick={() => setLanguage("ta")}>Use Tamil</button>
    <button onClick={() => setLanguage("unsupported")}>Invalid language</button>
    <output data-testid="language">{language}</output>
    <output data-testid="translated">{t("Settings")}</output>
  </>;
}

function settings() {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={["/profile/settings"]}>
        <Routes>
          <Route path="/profile/settings" element={<SettingsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  apiFetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("language settings", () => {
  it.each(["en", "zh", "ms", "ta"])("switches settings, sidebar and another route to %s and restores after refresh", (code) => {
    const t = createTranslator(code);
    const view = settings();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    fireEvent.change(screen.getByRole("combobox", { name: "Language" }), { target: { value: code } });
    expect(screen.getByRole("heading", { name: t("Settings") })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: t("Toggle privacy mode") })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(code === "zh" ? "zh-Hans" : code);
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(code);
    fireEvent.click(screen.getByRole("button", { name: t("Home") }));
    expect(screen.getByRole("heading", { name: t("Dashboard") })).toBeInTheDocument();
    view.unmount();
    settings();
    expect(screen.getByRole("combobox", { name: t("Language") })).toHaveValue(code);
    expect(screen.getByRole("heading", { name: t("Settings") })).toBeInTheDocument();
  });

  it("falls back to English for invalid stored values and ignores unsupported selections", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "unsupported");
    render(<LanguageProvider><LanguageControl /></LanguageProvider>);
    expect(screen.getByTestId("language")).toHaveTextContent("en");
    fireEvent.click(screen.getByText("Invalid language"));
    expect(screen.getByTestId("translated")).toHaveTextContent("Settings");
  });

  it("can switch languages when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<LanguageProvider><LanguageControl /></LanguageProvider>);
    fireEvent.click(screen.getByText("Use Tamil"));
    expect(screen.getByTestId("translated")).toHaveTextContent("அமைப்புகள்");
  });

  it("responds to changes from another browser tab", () => {
    render(<LanguageProvider><LanguageControl /></LanguageProvider>);
    fireEvent(window, new StorageEvent("storage", { key: LANGUAGE_STORAGE_KEY, newValue: "ms" }));
    expect(screen.getByTestId("translated")).toHaveTextContent("Tetapan");
    fireEvent(window, new StorageEvent("storage", { key: LANGUAGE_STORAGE_KEY, newValue: null }));
    expect(screen.getByTestId("translated")).toHaveTextContent("Settings");
  });

  it.each([["lost reports", ReportLostItemPage], ["found reports", ReportFoundItemPage]])("preserves drafts and canonical report values when translating %s", async (_name, Page) => {
    const item = {
      _id: "item-1", title: "My blue bag", description: "Original description", category: "Electronics",
      location: "Universiti Malaya (UM)", date: "2026-09-01", status: "Pending", images: [],
      reportLocation: { type: "Point", coordinates: [101.65, 3.12], formattedAddress: "Library" },
    };
    apiFetch.mockResolvedValue({ ok: true, json: async () => ({ data: item }) });
    render(<LanguageProvider><LanguageControl /><MemoryRouter initialEntries={["/?edit=item-1"]}><Page /></MemoryRouter></LanguageProvider>);
    const title = await screen.findByDisplayValue("My blue bag");
    fireEvent.change(title, { target: { value: "My unsubmitted draft" } });
    fireEvent.click(screen.getByText("Use Tamil"));
    expect(screen.getByDisplayValue("My unsubmitted draft")).toBe(title);
    expect(screen.getByDisplayValue("Original description")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "மின்னணுப் பொருட்கள்" })).toHaveValue("Electronics");
    expect(document.querySelector('select[name="category"]')).toHaveValue("Electronics");
    fireEvent.change(document.querySelector('select[name="status"]'), { target: { value: "Approved" } });
    fireEvent.click(screen.getByRole("button", { name: "மாற்றங்களைச் சேமி" }));
    await waitFor(() => expect(apiFetch.mock.calls.some(([, options]) => options?.method === "PUT")).toBe(true));
    const [, request] = apiFetch.mock.calls.find(([, options]) => options?.method === "PUT");
    expect(JSON.parse(request.body)).toMatchObject({ title: "My unsubmitted draft", category: "Electronics", status: "Approved" });
  });

  it.each([["found items", FoundItemsPage], ["lost items", LostItemsPage]])("keeps filter values and search terms unchanged in %s", async (_name, Page) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "ms");
    render(<LanguageProvider><LanguageControl /><MemoryRouter><Page /></MemoryRouter></LanguageProvider>);
    await screen.findByText("Tiada barang sepadan dengan penapis anda.");
    const option = screen.getByRole("option", { name: "Elektronik" });
    expect(option).toHaveValue("Electronics");
    const category = option.closest("select");
    fireEvent.change(category, { target: { value: "Electronics" } });
    const search = screen.getByPlaceholderText("Cari barang...");
    fireEvent.change(search, { target: { value: "my original search" } });
    fireEvent.click(screen.getByText("Use Tamil"));
    expect(category).toHaveValue("Electronics");
    expect(search).toHaveValue("my original search");
    expect(screen.getByRole("option", { name: "மின்னணுப் பொருட்கள்" }).selected).toBe(true);
  });
});
