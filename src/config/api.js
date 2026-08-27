// Production frontend and API are served by the same Express.js service unless
// VITE_API_BASE_URL is configured.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, "")
  : import.meta.env.DEV
    ? "http://localhost:3000"
    : "";
