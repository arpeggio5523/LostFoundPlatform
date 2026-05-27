import { clearAuth } from "./authState";

const API_BASE_URL = "http://localhost:3000";

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
    return API_BASE_URL;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (accessToken) => {
  refreshSubscribers.map((callback) => callback(accessToken));
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

export async function apiFetch(path, options = {}) {
  const url = buildApiUrl(path);

  const finalOptions = {
    ...options,
    credentials: "include",
    headers: authHeaders(options.headers || {}),
  };

  try {
    let response = await fetch(url, finalOptions);

    if (response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            finalOptions.headers.Authorization = `Bearer ${token}`;
            resolve(fetch(url, finalOptions));
          });
        });
      }

      const originalRequest = finalOptions;
      isRefreshing = true;

      try {
        const refreshRes = await fetch(buildApiUrl("/api/auth/refresh"), {
          method: "POST",
          credentials: "include", 
        });

        if (!refreshRes.ok) {
          throw new Error("Refresh failed");
        }

        const data = await refreshRes.json();
        
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
        }

        isRefreshing = false;
        onRefreshed(data.accessToken);
        refreshSubscribers = [];

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return await fetch(url, originalRequest);
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export { API_BASE_URL };
