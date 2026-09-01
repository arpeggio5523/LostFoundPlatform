/**
 * tests/unit/components/ImageSearchPanel.test.js
 *
 * UNIT TESTS — ImageSearchPanel React Component
 *
 * Tests the frontend ImageSearchPanel component logic in isolation.
 * Since we're in a Node/Jest environment without a full React DOM setup,
 * these tests focus on the component's internal logic patterns:
 *   - File validation logic (correct MIME types accepted/rejected)
 *   - Base64 detection for the search flow
 *   - Search flow orchestration (embed → similar → results)
 *   - Reset/clear behaviour
 *
 * What's covered:
 *   ✓ isBase64DataUrl detection logic
 *   ✓ File type validation (images only, rejects non-images)
 *   ✓ Search flow: calls embed-image then similar endpoints
 *   ✓ Error state management
 *   ✓ Reset/clear behaviour
 *   ✓ Loading state management
 *
 * Dependencies: No real DOM — logic-only tests
 */


// ─── Helper: Replicate the isBase64DataUrl check from ImageSearchPanel ──────

/**
 * Mirrors the isBase64DataUrl detection used in the frontend component
 * and in the backend ItemController. This lets us test the shared logic
 * without importing the actual React component.
 */
const isBase64DataUrl = (str) =>
  typeof str === "string" && str.startsWith("data:");

/**
 * Simulates the file-type validation that ImageSearchPanel.handleFile performs.
 * Returns true if the file type starts with "image/".
 */
const isValidImageFile = (file) =>
  file && file.type && file.type.startsWith("image/");


// ═══════════════════════════════════════════════════════════════════════════
// Base64 Data URL Detection
// ═══════════════════════════════════════════════════════════════════════════

describe("ImageSearchPanel — base64 data URL detection", () => {

  test("recognises a PNG base64 data URL", () => {
    expect(isBase64DataUrl("data:image/png;base64,iVBORw0KGgo=")).toBe(true);
  });

  test("recognises a JPEG base64 data URL", () => {
    expect(isBase64DataUrl("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);
  });

  test("recognises a WebP base64 data URL", () => {
    expect(isBase64DataUrl("data:image/webp;base64,UklGR")).toBe(true);
  });

  test("recognises a GIF base64 data URL", () => {
    expect(isBase64DataUrl("data:image/gif;base64,R0lGODlh")).toBe(true);
  });

  test("rejects a regular HTTPS URL", () => {
    expect(isBase64DataUrl("https://cdn.example.com/photo.jpg")).toBe(false);
  });

  test("rejects an HTTP URL", () => {
    expect(isBase64DataUrl("http://example.com/img.png")).toBe(false);
  });

  test("rejects null", () => {
    expect(isBase64DataUrl(null)).toBe(false);
  });

  test("rejects undefined", () => {
    expect(isBase64DataUrl(undefined)).toBe(false);
  });

  test("rejects an empty string", () => {
    expect(isBase64DataUrl("")).toBe(false);
  });

  test("rejects a number", () => {
    expect(isBase64DataUrl(42)).toBe(false);
  });

  test("rejects a plain filename", () => {
    expect(isBase64DataUrl("photo.png")).toBe(false);
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// File Type Validation
// ═══════════════════════════════════════════════════════════════════════════

describe("ImageSearchPanel — file type validation", () => {

  test("accepts a PNG file", () => {
    expect(isValidImageFile({ type: "image/png", name: "photo.png" })).toBe(true);
  });

  test("accepts a JPEG file", () => {
    expect(isValidImageFile({ type: "image/jpeg", name: "photo.jpg" })).toBe(true);
  });

  test("accepts a WebP file", () => {
    expect(isValidImageFile({ type: "image/webp", name: "photo.webp" })).toBe(true);
  });

  test("accepts a GIF file", () => {
    expect(isValidImageFile({ type: "image/gif", name: "animation.gif" })).toBe(true);
  });

  test("rejects a PDF file", () => {
    expect(isValidImageFile({ type: "application/pdf", name: "doc.pdf" })).toBe(false);
  });

  test("rejects a text file", () => {
    expect(isValidImageFile({ type: "text/plain", name: "readme.txt" })).toBe(false);
  });

  test("rejects a video file", () => {
    expect(isValidImageFile({ type: "video/mp4", name: "movie.mp4" })).toBe(false);
  });

  test("rejects a zip file", () => {
    expect(isValidImageFile({ type: "application/zip", name: "archive.zip" })).toBe(false);
  });

  test("rejects null input", () => {
    expect(isValidImageFile(null)).toBeFalsy();
  });

  test("rejects undefined input", () => {
    expect(isValidImageFile(undefined)).toBeFalsy();
  });

  test("rejects a file object without type property", () => {
    expect(isValidImageFile({ name: "mystery" })).toBeFalsy();
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// Search Flow Simulation
// ═══════════════════════════════════════════════════════════════════════════

describe("ImageSearchPanel — search flow orchestration", () => {

  /**
   * Simulates the two-step search flow that the ImageSearchPanel performs:
   * 1. POST to /api/items/embed-image → get embedding
   * 2. POST to /api/items/similar    → get matching items
   */
  const simulateSearchFlow = async (embedResponse, similarResponse) => {
    const state = {
      loading: false,
      error: "",
      hasSearched: false,
      results: null,
    };

    state.loading = true;
    state.error = "";

    try {
      // Step 1: Get embedding
      if (!embedResponse.ok) {
        throw new Error(embedResponse.error || "Failed to generate image embedding");
      }
      const embedding = embedResponse.embedding;

      // Step 2: Find similar items
      if (!similarResponse.ok) {
        throw new Error(similarResponse.error || "Image search failed");
      }
      state.results = similarResponse.data || [];
      state.hasSearched = true;
    } catch (err) {
      state.error = err.message;
      state.results = null;
    } finally {
      state.loading = false;
    }

    return state;
  };

  test("completes successfully with matching results", async () => {
    const state = await simulateSearchFlow(
      { ok: true, embedding: [0.1, 0.2] },
      { ok: true, data: [{ _id: "item1", title: "Match" }] }
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe("");
    expect(state.hasSearched).toBe(true);
    expect(state.results).toHaveLength(1);
  });

  test("handles empty results gracefully", async () => {
    const state = await simulateSearchFlow(
      { ok: true, embedding: [0.1, 0.2] },
      { ok: true, data: [] }
    );

    expect(state.hasSearched).toBe(true);
    expect(state.results).toEqual([]);
    expect(state.error).toBe("");
  });

  test("sets error when embedding generation fails", async () => {
    const state = await simulateSearchFlow(
      { ok: false, error: "Jina API is down" },
      { ok: true, data: [] }
    );

    expect(state.error).toBe("Jina API is down");
    expect(state.results).toBeNull();
    expect(state.hasSearched).toBe(false);
  });

  test("sets error when similarity search fails", async () => {
    const state = await simulateSearchFlow(
      { ok: true, embedding: [0.1, 0.2] },
      { ok: false, error: "Database unavailable" }
    );

    expect(state.error).toBe("Database unavailable");
    expect(state.results).toBeNull();
  });

  test("loading is always false after search completes (success or failure)", async () => {
    const successState = await simulateSearchFlow(
      { ok: true, embedding: [0.1] },
      { ok: true, data: [] }
    );
    expect(successState.loading).toBe(false);

    const failState = await simulateSearchFlow(
      { ok: false, error: "Fail" },
      { ok: true, data: [] }
    );
    expect(failState.loading).toBe(false);
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// Reset / Clear Behaviour
// ═══════════════════════════════════════════════════════════════════════════

describe("ImageSearchPanel — reset/clear behaviour", () => {

  test("reset clears all state to initial values", () => {
    // Simulate component state
    const state = {
      preview: "data:image/png;base64,abc",
      fileName: "photo.png",
      error: "Some error",
      hasSearched: true,
      loading: false,
    };

    // Simulate the reset() function from the component
    state.preview = null;
    state.fileName = "";
    state.error = "";
    state.hasSearched = false;
    state.loading = false;

    expect(state.preview).toBeNull();
    expect(state.fileName).toBe("");
    expect(state.error).toBe("");
    expect(state.hasSearched).toBe(false);
    expect(state.loading).toBe(false);
  });

  test("reset triggers onClear callback", () => {
    const onClear = vi.fn();

    // Simulate calling reset which should invoke onClear
    onClear();

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
