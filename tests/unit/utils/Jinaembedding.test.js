/**
 * unit/utils/jinaEmbedding.test.js
 * Converted from node:test to Jest.
 *
 * Tests generateImageEmbedding (services/jinaEmbedding.js) with a mocked global.fetch.
 */

import { generateImageEmbedding } from "../../../src/services/jinaEmbedding.js";

function mockFetch(responseBody, statusCode = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: statusCode >= 200 && statusCode < 300,
    status: statusCode,
    statusText: statusCode === 200 ? "OK" : "Error",
    json: async () => responseBody,
    text: async () => JSON.stringify(responseBody),
  });
}

describe("jinaEmbedding — generateImageEmbedding", () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.JINA_API_KEY;

  beforeEach(() => {
    process.env.JINA_API_KEY = "test-api-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.JINA_API_KEY = originalKey;
  });

  const fakeEmbedding = Array(1024).fill(0.42);

  test("returns embedding array on successful Jina response", async () => {
    mockFetch({ data: [{ embedding: fakeEmbedding }] });
    const result = await generateImageEmbedding("data:image/png;base64,abc123");
    expect(result).toEqual(fakeEmbedding);
  });

  test("throws descriptive error when Jina returns non-OK status", async () => {
    mockFetch({ detail: "Invalid API key" }, 401);
    await expect(
      generateImageEmbedding("data:image/png;base64,abc123")
    ).rejects.toThrow(/HTTP 401/i);
  });

  test("throws when Jina response has no embedding data", async () => {
    mockFetch({ data: [{}] }); // missing embedding
    await expect(
      generateImageEmbedding("data:image/png;base64,abc123")
    ).rejects.toThrow(/unexpected response/i);
  });

  test("throws when JINA_API_KEY is missing", async () => {
    delete process.env.JINA_API_KEY;
    await expect(
      generateImageEmbedding("data:image/png;base64,abc123")
    ).rejects.toThrow(/JINA_API_KEY/i);
  });

  test("throws on network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));
    await expect(
      generateImageEmbedding("data:image/png;base64,abc123")
    ).rejects.toThrow(/network error/i);
  });
});