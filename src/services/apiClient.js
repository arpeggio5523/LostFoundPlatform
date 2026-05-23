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

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export { API_BASE_URL };
