/**
 * tests/unit/utils/imageSimilarity.jinaEmbedding.test.js
 *
 * UNIT TESTS — generateImageEmbedding (services/jinaEmbedding.js)
 *
 * These tests verify the Jina AI API client that converts a base64 image
 * into a 1024-dimensional embedding vector. All network calls are mocked
 * via `global.fetch` — no real HTTP requests are made.
 *
 * What's covered:
 *   ✓ Successful embedding generation with valid response
 *   ✓ Correct Jina API request structure (URL, headers, body)
 *   ✓ HTTP error handling (401, 403, 429, 500)
 *   ✓ Missing JINA_API_KEY env var
 *   ✓ Network failure (fetch rejects)
 *   ✓ Malformed API response (missing embedding data)
 *   ✓ JSON parse errors
 *   ✓ Empty data array in response
 *   ✓ Various image input formats (base64, URL)
 *
 * Dependencies: Mocked global.fetch only
 */

import { generateImageEmbedding } from "../../../src/services/jinaEmbedding.js";
import {
  FAKE_EMBEDDING,
  FAKE_BASE64_IMAGE,
  installMockFetch,
  installNetworkErrorFetch,
  jinaSuccessResponse,
  jinaUnauthorizedResponse,
  jinaMalformedResponse,
  jinaEmptyDataResponse,
} from "../../mocks/imageSimilarity.mocks.js";

describe("generateImageEmbedding — Jina AI API client", () => {

  // ─── Setup / Teardown ─────────────────────────────────────────────────

  const originalFetch = global.fetch;
  const originalKey = process.env.JINA_API_KEY;

  beforeEach(() => {
    process.env.JINA_API_KEY = "test-api-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalKey === undefined) {
      delete process.env.JINA_API_KEY;
    } else {
      process.env.JINA_API_KEY = originalKey;
    }
  });


  // ─── Successful Response Tests ────────────────────────────────────────

  test("returns the embedding array on successful Jina response", async () => {
    installMockFetch(jinaSuccessResponse());

    const result = await generateImageEmbedding(FAKE_BASE64_IMAGE);
    expect(result).toEqual(FAKE_EMBEDDING);
  });

  test("calls fetch with correct Jina API URL", async () => {
    const mockFn = installMockFetch(jinaSuccessResponse());

    await generateImageEmbedding(FAKE_BASE64_IMAGE);

    expect(mockFn).toHaveBeenCalledTimes(1);
    const [url] = mockFn.mock.calls[0];
    expect(url).toBe("https://api.jina.ai/v1/embeddings");
  });

  test("includes correct Authorization header with Bearer token", async () => {
    const mockFn = installMockFetch(jinaSuccessResponse());

    await generateImageEmbedding(FAKE_BASE64_IMAGE);

    const [, options] = mockFn.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer test-api-key");
  });

  test("sends correct request body with model and image input", async () => {
    const mockFn = installMockFetch(jinaSuccessResponse());

    await generateImageEmbedding(FAKE_BASE64_IMAGE);

    const [, options] = mockFn.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.model).toBe("jina-clip-v2");
    expect(body.input).toHaveLength(1);
    expect(body.input[0].image).toBe(FAKE_BASE64_IMAGE);
  });

  test("uses POST method for the API request", async () => {
    const mockFn = installMockFetch(jinaSuccessResponse());

    await generateImageEmbedding(FAKE_BASE64_IMAGE);

    const [, options] = mockFn.mock.calls[0];
    expect(options.method).toBe("POST");
  });

  test("sets Content-Type to application/json", async () => {
    const mockFn = installMockFetch(jinaSuccessResponse());

    await generateImageEmbedding(FAKE_BASE64_IMAGE);

    const [, options] = mockFn.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });


  // ─── HTTP Error Handling Tests ────────────────────────────────────────

  test("throws on HTTP 401 (unauthorized) with descriptive message", async () => {
    installMockFetch(jinaUnauthorizedResponse(), 401);

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/HTTP 401/i);
  });

  test("throws on HTTP 403 (forbidden)", async () => {
    installMockFetch({ detail: "Forbidden" }, 403);

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/HTTP 403/i);
  });

  test("throws on HTTP 429 (rate limited)", async () => {
    installMockFetch({ detail: "Rate limit exceeded" }, 429);

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/HTTP 429/i);
  });

  test("throws on HTTP 500 (internal server error)", async () => {
    installMockFetch({ error: "Internal server error" }, 500);

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/HTTP 500/i);
  });


  // ─── Missing API Key Tests ────────────────────────────────────────────

  test("throws when JINA_API_KEY is not set", async () => {
    delete process.env.JINA_API_KEY;

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/JINA_API_KEY/i);
  });

  test("throws when JINA_API_KEY is empty string", async () => {
    process.env.JINA_API_KEY = "";

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/JINA_API_KEY/i);
  });


  // ─── Network Failure Tests ────────────────────────────────────────────

  test("throws on network error with descriptive message", async () => {
    installNetworkErrorFetch("Connection refused");

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/network error/i);
  });

  test("throws on DNS resolution failure", async () => {
    installNetworkErrorFetch("getaddrinfo ENOTFOUND api.jina.ai");

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/network error/i);
  });

  test("throws on timeout", async () => {
    installNetworkErrorFetch("The operation was aborted");

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/network error/i);
  });


  // ─── Malformed Response Tests ─────────────────────────────────────────

  test("throws when response has no embedding data", async () => {
    installMockFetch(jinaMalformedResponse());

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/unexpected response/i);
  });

  test("throws when response data array is empty", async () => {
    installMockFetch(jinaEmptyDataResponse());

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/unexpected response/i);
  });

  test("throws when response data is null", async () => {
    installMockFetch({ data: null });

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/unexpected response/i);
  });

  test("throws when response JSON is invalid", async () => {
    // Simulate json() throwing a parse error
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError("Unexpected token"); },
    });

    await expect(
      generateImageEmbedding(FAKE_BASE64_IMAGE)
    ).rejects.toThrow(/parse error/i);
  });


  // ─── Input Format Tests ───────────────────────────────────────────────

  test("accepts a base64 PNG data URL", async () => {
    installMockFetch(jinaSuccessResponse());
    const result = await generateImageEmbedding("data:image/png;base64,abc123");
    expect(result).toEqual(FAKE_EMBEDDING);
  });

  test("accepts a base64 JPEG data URL", async () => {
    installMockFetch(jinaSuccessResponse());
    const result = await generateImageEmbedding("data:image/jpeg;base64,/9j/abc");
    expect(result).toEqual(FAKE_EMBEDDING);
  });

  test("accepts a base64 WebP data URL", async () => {
    installMockFetch(jinaSuccessResponse());
    const result = await generateImageEmbedding("data:image/webp;base64,UklGR");
    expect(result).toEqual(FAKE_EMBEDDING);
  });

  test("accepts a public URL as input", async () => {
    installMockFetch(jinaSuccessResponse());
    const result = await generateImageEmbedding("https://example.com/photo.jpg");
    expect(result).toEqual(FAKE_EMBEDDING);
  });
});
