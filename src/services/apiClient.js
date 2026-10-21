import { clearAuth } from "./authState";
import { API_BASE_URL } from "../config/api";

export function getToken() {
  return (
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

export function authHeaders(extraHeaders = {}) {
  const token = getToken();

  if (!token) {
    return { ...extraHeaders };
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function buildApiUrl(path) {
  if (!path) {
    return API_BASE_URL || window.location.origin;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

let refreshPromise = null;

// Bound both connection time and response-body loading.
export async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 15000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = await response.arrayBuffer();
    const result = new Response([204, 205, 304].includes(response.status) ? null : body, {
      status: response.status, statusText: response.statusText, headers: response.headers,
    });
    const readJson = result.json.bind(result);
    result.json = async () => {
      try { return await readJson(); }
      catch { throw new Error("The server returned an unexpected response. Please try again."); }
    };
    return result;
  } catch (error) {
    const mutation = !["GET", "HEAD"].includes((options.method || "GET").toUpperCase());
    throw new Error(
      (controller.signal.aborted ? "The request timed out." : "Unable to connect to the server.") +
      (mutation ? " Your changes may have been saved. Check the latest information before retrying." : " Please check your connection and try again."),
      { cause: error },
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}

async function refreshAccessToken() {
  const response = await fetchWithTimeout(buildApiUrl("/api/auth/refresh"), {
    method: "POST", credentials: "include",
  });
  if (!response.ok) {
    if ([401, 403].includes(response.status)) {
      clearAuth();
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("The server is temporarily unavailable. Please try again shortly.");
  }
  const data = await response.json();
  if (!data.accessToken) throw new Error("Unable to renew your session. Please try again.");
  for (const storage of [sessionStorage, localStorage]) {
    if (storage.getItem("accessToken")) storage.setItem("accessToken", data.accessToken);
  }
  localStorage.setItem("token", data.accessToken);
  return data.accessToken;
}

export async function apiFetch(path, options = {}) {
  const url = buildApiUrl(path);
  const finalOptions = { ...options, credentials: "include", headers: authHeaders(options.headers || {}) };
  let response = await fetchWithTimeout(url, finalOptions);
  if (response.status === 401) {
    // Every caller settles when refresh fails; temporary outages preserve login.
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
    }
    const token = await refreshPromise;
    response = await fetchWithTimeout(url, {
      ...finalOptions, headers: { ...finalOptions.headers, Authorization: `Bearer ${token}` },
    });
  }
  if (response.status >= 500) {
    throw new Error("The server is temporarily unavailable. Please try again shortly.");
  }
  return response;
}

export { API_BASE_URL };
