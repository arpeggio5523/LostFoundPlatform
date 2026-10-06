/**
 * ImageSearchPanel.jsx
 *
 * Reusable drag-and-drop image search panel for the Lost/Found browse pages.
 * Lets users upload a photo to find visually similar items using vector search.
 *
 * Usage:
 *   <ImageSearchPanel type="Lost" onResults={setSearchResults} onClear={handleClear} />
 *
 * Flow:
 *   1. User drops/selects an image
 *   2. Image is converted to base64 and sent to POST /api/items/embed-image
 *   3. The returned embedding is sent to POST /api/items/similar
 *   4. onResults(items) is called with the matching items
 */

import React, { useState, useRef } from "react";
import { apiFetch, authHeaders } from "../services/apiClient";

export default function ImageSearchPanel({ type, onResults, onClear }) {
  const [preview, setPreview]         = useState(null);
  const [fileName, setFileName]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const fileInputRef                  = useRef(null);

  const reset = () => {
    setPreview(null);
    setFileName("");
    setError("");
    setHasSearched(false);
    setLoading(false);
    onClear();
  };

  const runSearch = async (base64DataUrl) => {
    setLoading(true);
    setError("");
    try {
      // Step 1: get embedding from backend proxy
      const embedRes = await apiFetch("/api/items/embed-image", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ imageBase64: base64DataUrl }),
      });

      if (!embedRes.ok) {
        const body = await embedRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate image embedding");
      }

      const { embedding } = await embedRes.json();

      // Step 2: find similar items
      const similarRes = await apiFetch("/api/items/similar", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ embedding, type, limit: 10 }),
      });

      if (!similarRes.ok) {
        const body = await similarRes.json().catch(() => ({}));
        throw new Error(body.error || "Image search failed");
      }

      const data = await similarRes.json();
      onResults(data.data || []);
      setHasSearched(true);
    } catch (err) {
      setError(err.message || "Image search failed. Please try again.");
      onClear();
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, GIF, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      setFileName(file.name);
      setError("");
      setHasSearched(false);
      runSearch(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "16px 20px",
        marginBottom: 20,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Camera icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
            Search by Image
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            — drag a photo to find visually similar {type === "Lost" ? "lost" : "found"} items
          </span>
        </div>
        {(preview || hasSearched) && (
          <button
            onClick={reset}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear search
          </button>
        )}
      </div>

      {/* Drop zone or preview */}
      {preview ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={preview}
            alt="Search image"
            style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1px solid var(--color-border)" }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
              {fileName}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {loading
                ? "Searching for similar items…"
                : hasSearched
                ? "Showing image search results"
                : "Ready"}
            </div>
          </div>
          {loading && (
            <svg
              width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2"
              style={{ animation: "spin 1s linear infinite", marginLeft: "auto" }}
            >
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "var(--color-brand)" : "var(--color-border)"}`,
            borderRadius: 12,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            background: dragOver ? "var(--color-brand-active-bg)" : "var(--color-bg-raised)",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>Upload an image</span>
            {" "}or drag and drop — PNG, JPG, WebP up to 10 MB
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>{error}</div>
      )}
    </div>
  );
}
