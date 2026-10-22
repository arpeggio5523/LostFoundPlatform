import { apiFetch } from "./apiClient";

export const REPORT_CATEGORIES = [
  "Harassment",
  "Spam",
  "Scam or Fraud",
  "Inappropriate Content",
  "Impersonation",
  "Other",
];

export const REPORT_DESCRIPTION_MIN = 10;
export const REPORT_DESCRIPTION_MAX = 1000;

async function parse(res, fallback) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || fallback);
  return data;
}

const jsonRequest = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export async function submitReport({ conversationId, category, description, evidenceImage }) {
  const res = await apiFetch(
    "/api/reports",
    jsonRequest("POST", { conversationId, category, description, evidenceImage })
  );
  return parse(res, "Failed to submit report");
}

export async function fetchReports(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return parse(await apiFetch(`/api/reports${query}`), "Failed to load reports");
}

export async function fetchReport(id) {
  return parse(await apiFetch(`/api/reports/${id}`), "Failed to load report");
}

export async function removeReportedUser(id, adminNote = "") {
  const res = await apiFetch(`/api/reports/${id}/remove-user`, jsonRequest("PATCH", { adminNote }));
  return parse(res, "Failed to remove user");
}

export async function rejectReport(id, adminNote = "") {
  const res = await apiFetch(`/api/reports/${id}/reject`, jsonRequest("PATCH", { adminNote }));
  return parse(res, "Failed to reject report");
}
