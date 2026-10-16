import { afterEach, beforeEach, expect, test, vi } from "vitest";
vi.mock("../../../src/services/authState", () => ({ clearAuth: vi.fn() }));
import { clearAuth } from "../../../src/services/authState";
import { apiFetch } from "../../../src/services/apiClient";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

test("connection failures show useful errors and do not automatically retry writes", async () => {
  fetch.mockRejectedValue(new TypeError("Failed to fetch"));
  await expect(apiFetch("/api/items", { method: "POST" })).rejects.toThrow("Unable to connect to the server");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("unavailable backends produce informative errors", async () => {
  fetch.mockResolvedValue(new Response("Unavailable", { status: 503 }));
  await expect(apiFetch("/api/items")).rejects.toThrow("temporarily unavailable");
});

test("malformed server responses produce informative errors", async () => {
  fetch.mockResolvedValue(new Response("<html>Proxy error</html>", { status: 200 }));
  const response = await apiFetch("/api/items");
  await expect(response.json()).rejects.toThrow("unexpected response");
});

test("hung requests time out", async () => {
  vi.useFakeTimers();
  fetch.mockImplementation((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")));
  }));
  const result = expect(apiFetch("/api/items")).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(15000);
  await result;
});

test("concurrent requests settle on refresh outage without logging the user out", async () => {
  let rejectRefresh;
  fetch.mockImplementation((url) => url.endsWith("/api/auth/refresh")
    ? new Promise((resolve, reject) => { rejectRefresh = reject; })
    : Promise.resolve(new Response("{}", { status: 401 })));
  const pending = Promise.allSettled([apiFetch("/api/items"), apiFetch("/api/messages/conversations")]);
  await vi.waitFor(() => expect(rejectRefresh).toBeTypeOf("function"));
  rejectRefresh(new Error("offline"));
  expect((await pending).every(({ status }) => status === "rejected")).toBe(true);
  expect(clearAuth).not.toHaveBeenCalled();
  expect(fetch.mock.calls.filter(([url]) => url.endsWith("/api/auth/refresh"))).toHaveLength(1);
});

test("recovered service works on the next request", async () => {
  fetch.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(new Response('{"data":[]}', { status: 200 }));
  await expect(apiFetch("/api/items")).rejects.toThrow("Unable to connect");
  expect(await (await apiFetch("/api/items")).json()).toEqual({ data: [] });
});
