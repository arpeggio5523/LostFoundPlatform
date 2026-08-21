// Production Frontend and API served by the same Express.js service.
// Remove hardcoded backend API URL.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

