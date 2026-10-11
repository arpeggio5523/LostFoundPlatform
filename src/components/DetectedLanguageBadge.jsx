import { useEffect, useState } from "react";
import { Languages, LoaderCircle } from "lucide-react";
import { apiFetch } from "../services/apiClient";

const LANGUAGE_NAMES = new Intl.DisplayNames(["en"], { type: "language" });

const getLanguageName = (code) => {
  try {
    return LANGUAGE_NAMES.of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

export default function DetectedLanguageBadge({ text }) {
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = text.trim();
    setDetection(null);

    if (query.length < 2) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await apiFetch("/api/language/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: query }),
        });
        if (!response.ok) return;
        const result = await response.json();
        if (!cancelled && result.language?.toLowerCase() !== "en") {
          setDetection(result);
        }
      } catch {
        // Detection is supplementary feedback; local search remains available.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text]);

  if (!loading && !detection) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        color: "var(--color-text-secondary)",
        fontSize: 12,
      }}
    >
      {loading ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <Languages size={13} aria-hidden="true" />}
      {loading ? "Detecting language…" : `Detected: ${getLanguageName(detection.language)}`}
    </div>
  );
}
