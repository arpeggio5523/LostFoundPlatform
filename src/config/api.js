// Production Frontend and API served by the same Express.js service.
// Remove hardcoded backend API URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

