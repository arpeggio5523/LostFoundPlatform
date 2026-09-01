/**
 * tests/mocks/imageSimilarity.mocks.js
 *
 * Centralised mock data and factory helpers for all image-similarity tests.
 *
 * This file provides:
 *   - Realistic embedding vectors (1024-dim float arrays)
 *   - Pre-built item documents with/without embeddings
 *   - Jina AI API response stubs (success + error)
 *   - Mock fetch helpers that simulate Jina API behaviour
 *   - Helper for creating Express req/res mocks
 *
 * Consumed by unit, integration, setup, and e2e tests.
 */

// ─── Constants ──────────────────────────────────────────────────────────────

/** Default vector dimension matching the Jina CLIP-v2 model output */
export const VECTOR_DIMENSIONS = 1024;

/** A valid 1024-element embedding filled with 0.42 */
export const FAKE_EMBEDDING = Array(VECTOR_DIMENSIONS).fill(0.42);

/** A second distinct embedding for similarity-comparison tests */
export const FAKE_EMBEDDING_ALT = Array(VECTOR_DIMENSIONS).fill(0.55);

/** A short (wrong-length) embedding for validation-failure tests */
export const SHORT_EMBEDDING = [0.1, 0.2, 0.3];

/** An embedding that contains NaN — should be rejected by validation */
export const NAN_EMBEDDING = (() => {
  const arr = Array(VECTOR_DIMENSIONS).fill(0.1);
  arr[500] = NaN;
  return arr;
})();

/** An embedding that contains Infinity — should be rejected by validation */
export const INFINITY_EMBEDDING = (() => {
  const arr = Array(VECTOR_DIMENSIONS).fill(0.1);
  arr[0] = Infinity;
  return arr;
})();

/** A sample base64 data URL (minimal valid PNG header) */
export const FAKE_BASE64_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

/** A regular URL image (not base64 — should NOT trigger embedding generation) */
export const FAKE_URL_IMAGE = "https://cdn.example.com/images/wallet.jpg";

/** Fake Jina API key used in all tests */
export const FAKE_JINA_API_KEY = "jina_test_api_key_12345";

/** Fake MongoDB ObjectId strings */
export const FAKE_ITEM_ID = "64f000000000000000000099";
export const FAKE_USER_ID = "64f000000000000000000001";
export const FAKE_OWNER_ID = "64f000000000000000000002";


// ─── Jina API Response Stubs ────────────────────────────────────────────────

/**
 * Successful Jina API response containing one embedding.
 * Mirrors the real Jina CLIP-v2 response structure.
 */
export const jinaSuccessResponse = (embedding = FAKE_EMBEDDING) => ({
  model: "jina-clip-v2",
  object: "list",
  data: [
    {
      object: "embedding",
      index: 0,
      embedding,
    },
  ],
  usage: { total_tokens: 1 },
});

/**
 * Jina API error response — invalid API key.
 */
export const jinaUnauthorizedResponse = () => ({
  detail: "Invalid API key",
});

/**
 * Jina API response missing the embedding field — triggers "unexpected response" error.
 */
export const jinaMalformedResponse = () => ({
  data: [{ object: "embedding", index: 0 }],
});

/**
 * Jina API response with an empty data array.
 */
export const jinaEmptyDataResponse = () => ({
  data: [],
});


// ─── Mock Fetch Factory ─────────────────────────────────────────────────────

/**
 * Installs a mock `global.fetch` that returns a canned Response.
 *
 * @param {object} body     - JSON body to return
 * @param {number} status   - HTTP status code (default 200)
 * @returns {jest.Mock}      - The mock function (so callers can assert on it)
 */
export const installMockFetch = (body, status = 200) => {
  const mockFn = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
  global.fetch = mockFn;
  return mockFn;
};

/**
 * Installs a mock `global.fetch` that rejects with a network error.
 *
 * @param {string} message - Error message for the rejection
 * @returns {jest.Mock}
 */
export const installNetworkErrorFetch = (message = "Network failure") => {
  const mockFn = jest.fn().mockRejectedValue(new Error(message));
  global.fetch = mockFn;
  return mockFn;
};


// ─── Item Document Factories ────────────────────────────────────────────────

/**
 * Creates a mock Item document that looks like a Mongoose document.
 *
 * @param {object} overrides - Fields to merge into the default document
 * @returns {object} A plain JS object mimicking a Mongoose Item document
 */
export const mockItemDoc = (overrides = {}) => ({
  _id: FAKE_ITEM_ID,
  title: "Found black wallet",
  description: "Found near the library entrance, contains a student ID.",
  category: "Accessories",
  type: "Found",
  location: "Universiti Malaya (UM)",
  date: "2026-08-20",
  user: "Jane Doe",
  status: "Approved",
  reportedBy: FAKE_USER_ID,
  images: [],
  createdAt: "2026-08-20T10:00:00.000Z",
  updatedAt: "2026-08-20T10:00:00.000Z",
  ...overrides,
});

/**
 * Creates a mock Item document WITH an image embedding attached.
 *
 * @param {number[]} embedding - The embedding vector (defaults to FAKE_EMBEDDING)
 * @param {object}   overrides - Additional field overrides
 * @returns {object}
 */
export const mockItemWithEmbedding = (embedding = FAKE_EMBEDDING, overrides = {}) =>
  mockItemDoc({
    images: [FAKE_BASE64_IMAGE],
    imageEmbedding: embedding,
    ...overrides,
  });

/**
 * Creates multiple mock items with unique IDs and varying similarity scores.
 * Useful for testing the findSimilarItems results ordering.
 *
 * @param {number} count - Number of items to generate
 * @returns {object[]}
 */
export const mockSimilarItemResults = (count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    ...mockItemDoc({
      _id: `64f00000000000000000010${i}`,
      title: `Similar item ${i + 1}`,
    }),
    similarityScore: 0.95 - i * 0.05, // 0.95, 0.90, 0.85, ...
    mongoScore: (0.95 - i * 0.05 + 1) / 2,  // reverse of the cosine transform
  }));


// ─── Express Req/Res Mocks ─────────────────────────────────────────────────

/**
 * Creates a minimal mock Express `req` object with common defaults.
 *
 * @param {object} overrides - Properties to merge (body, params, query, user)
 * @returns {object}
 */
export const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: FAKE_USER_ID },
  ...overrides,
});

/**
 * Creates a minimal mock Express `res` object that records status + json calls.
 * Chainable like the real Express res.
 *
 * @returns {object} An object with `status`, `json`, `statusCode`, and `body`.
 */
export const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((body) => {
    res.body = body;
    return res;
  });
  return res;
};
