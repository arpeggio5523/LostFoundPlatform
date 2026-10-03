/**
 * tests/e2e/imageSimilarity.e2e.test.js
 *
 * END-TO-END TESTS — Image Similarity Feature
 *
 * These tests simulate the complete user journey through the image
 * similarity feature, from uploading an image to receiving search results.
 * All external services (Jina API, MongoDB Atlas Vector Search) are mocked,
 * but the full Express route chain is exercised.
 *
 * User flows tested:
 *   1. Upload image → generate embedding → find similar items
 *   2. Create item with image → embedding auto-generated
 *   3. Find similar items by existing item ID
 *   4. Handle various failure scenarios gracefully
 *
 * What's covered:
 *   ✓ Full search flow: embed-image → similar → results
 *   ✓ Item creation with auto-generated embedding
 *   ✓ Similar-by-ID lookup (existing item → find matches)
 *   ✓ Empty results scenario
 *   ✓ Jina API failure during search (graceful degradation)
 *   ✓ Invalid image format rejection
 *   ✓ Multiple sequential searches
 *   ✓ Search with type filter (Lost vs Found)
 *   ✓ Large result sets with limit enforcement
 *
 * Dependencies: supertest, mocked Item/User/services
 */

import request from "supertest";

// ─── Module Mocks ───────────────────────────────────────────────────────────

vi.mock("../../../src/models/Item.js", () => {
  const ItemMock = vi.fn();
  ItemMock.aggregate = vi.fn();
  ItemMock.findById = vi.fn();
  ItemMock.findOne = vi.fn();
  return { default: ItemMock };
});
vi.mock("../../../src/models/User.js");
vi.mock("../../../src/utils/emailService.js");
vi.mock("../../../src/services/imageEmbedding.js");
vi.mock("../../../src/services/jinaEmbedding.js");

import Item from "../../../src/models/Item.js";
import { validateImageEmbedding } from "../../../src/services/imageEmbedding.js";
import { generateImageEmbedding } from "../../../src/services/jinaEmbedding.js";
import { buildTestApp } from "../../utils/buildTestApp.js";
import {
  createItem,
  findSimilarItems,
  findSimilarItemsById,
  embedImage,
} from "../../../src/controllers/ItemController.js";
import {
  FAKE_EMBEDDING,
  FAKE_EMBEDDING_ALT,
  FAKE_BASE64_IMAGE,
  FAKE_ITEM_ID,
  FAKE_USER_ID,
  mockItemDoc,
  mockItemWithEmbedding,
  mockSimilarItemResults,
} from "../../mocks/imageSimilarity.mocks.js";
import { VALID_FOUND_ITEM, mockSavedDoc } from "../../utils/fixtures.js";


// ─── App Builder ────────────────────────────────────────────────────────────

/**
 * Builds a fully-wired Express app with all image-similarity endpoints.
 * This mirrors the real app's route configuration for end-to-end testing.
 */
const buildApp = () =>
  buildTestApp((app) => {
    app.post("/api/items/embed-image", embedImage);
    app.post("/api/items/similar", findSimilarItems);
    app.post("/api/items", createItem);
    app.get("/api/items/:itemId/similar", findSimilarItemsById);
  });


// ─── Common Setup ───────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  validateImageEmbedding.mockImplementation((v) => v);
});


// ═══════════════════════════════════════════════════════════════════════════
// E2E Flow 1: Upload Image → Embed → Find Similar Items
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — Upload image and find similar items", () => {

  test("complete flow: upload → embed → search → results", async () => {
    // Arrange: Mock the Jina API to return a known embedding
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    // Arrange: Mock the vector search to return matching items
    const similarItems = mockSimilarItemResults(3);
    Item.aggregate = vi.fn().mockResolvedValue(similarItems);

    const app = buildApp();

    // Step 1: User uploads image → backend generates embedding
    const embedRes = await request(app)
      .post("/api/items/embed-image")
      .send({ imageBase64: FAKE_BASE64_IMAGE });

    expect(embedRes.status).toBe(200);
    expect(embedRes.body.embedding).toEqual(FAKE_EMBEDDING);

    // Step 2: Frontend sends embedding to find similar items
    const searchRes = await request(app)
      .post("/api/items/similar")
      .send({ embedding: embedRes.body.embedding, type: "Found" });

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.count).toBe(3);
    expect(searchRes.body.data).toHaveLength(3);

    // Verify results have similarity scores
    searchRes.body.data.forEach((item) => {
      expect(item).toHaveProperty("similarityScore");
      expect(item.similarityScore).toBeGreaterThanOrEqual(0);
      expect(item.similarityScore).toBeLessThanOrEqual(1);
    });
  });

  test("search returns empty results for an image with no visual matches", async () => {
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);
    Item.aggregate = vi.fn().mockResolvedValue([]);

    const app = buildApp();

    // Generate embedding
    const embedRes = await request(app)
      .post("/api/items/embed-image")
      .send({ imageBase64: FAKE_BASE64_IMAGE });

    expect(embedRes.status).toBe(200);

    // Search returns no matches
    const searchRes = await request(app)
      .post("/api/items/similar")
      .send({ embedding: embedRes.body.embedding });

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.count).toBe(0);
    expect(searchRes.body.data).toEqual([]);
  });

  test("search with type filter only returns items of that type", async () => {
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    // Only Lost items in results
    const lostItems = [
      mockItemDoc({ _id: "lost1", type: "Lost", title: "Lost phone" }),
    ];
    // Add similarityScore and mongoScore for the pipeline
    lostItems[0].similarityScore = 0.92;
    lostItems[0].mongoScore = 0.96;

    Item.aggregate = vi.fn().mockResolvedValue(lostItems);

    const app = buildApp();

    const embedRes = await request(app)
      .post("/api/items/embed-image")
      .send({ imageBase64: FAKE_BASE64_IMAGE });

    const searchRes = await request(app)
      .post("/api/items/similar")
      .send({ embedding: embedRes.body.embedding, type: "Lost" });

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.every((i) => i.type === "Lost")).toBe(true);
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// E2E Flow 2: Create Item with Auto-Embedding
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — Create item with automatic embedding generation", () => {

  test("creating an item with a base64 image auto-generates embedding", async () => {
    const saved = mockSavedDoc({ images: [FAKE_BASE64_IMAGE] });
    let constructedInstance;
    Item.mockImplementation(function (payload) {
      Object.keys(payload || {}).forEach(k => Object.defineProperty(this, k, { value: payload[k], writable: true, enumerable: true, configurable: true }));
      this.save = vi.fn().mockResolvedValue(saved);
      constructedInstance = this;
    });
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: [FAKE_BASE64_IMAGE] });

    // Item created successfully
    expect(res.status).toBe(201);

    // Embedding was generated and stored on the item
    expect(generateImageEmbedding).toHaveBeenCalledWith(FAKE_BASE64_IMAGE);
    expect(constructedInstance.imageEmbedding).toEqual(FAKE_EMBEDDING);
  });

  test("item creation succeeds even when embedding generation fails", async () => {
    const saved = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.keys(payload || {}).forEach(k => Object.defineProperty(this, k, { value: payload[k], writable: true, enumerable: true, configurable: true }));
      this.save = vi.fn().mockResolvedValue(saved);
    });
    generateImageEmbedding.mockRejectedValue(new Error("Jina quota exceeded"));

    // Suppress console.warn
    const origWarn = console.warn;
    console.warn = vi.fn();

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: [FAKE_BASE64_IMAGE] });

    // Item still saves without embedding
    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();

    console.warn = origWarn;
  });

  test("item with URL-only images skips embedding generation entirely", async () => {
    const saved = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.keys(payload || {}).forEach(k => Object.defineProperty(this, k, { value: payload[k], writable: true, enumerable: true, configurable: true }));
      this.save = vi.fn().mockResolvedValue(saved);
    });

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: ["https://cdn.example.com/existing.jpg"] });

    expect(res.status).toBe(201);
    expect(generateImageEmbedding).not.toHaveBeenCalled();
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// E2E Flow 3: Find Similar by Existing Item ID
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — Find similar items by existing item ID", () => {

  test("retrieves item embedding and finds similar items", async () => {
    const itemDoc = mockItemWithEmbedding();
    Item.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(itemDoc),
    });

    const similarItems = mockSimilarItemResults(2);
    Item.aggregate = vi.fn().mockResolvedValue(similarItems);

    const res = await request(buildApp())
      .get(`/api/items/${FAKE_ITEM_ID}/similar`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  test("returns 404 when item ID does not exist", async () => {
    Item.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const res = await request(buildApp())
      .get("/api/items/nonexistent123456/similar");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test("returns 400 when item has no stored embedding", async () => {
    const itemWithoutEmbed = { _id: FAKE_ITEM_ID, imageEmbedding: null };
    Item.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(itemWithoutEmbed),
    });

    const res = await request(buildApp())
      .get(`/api/items/${FAKE_ITEM_ID}/similar`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no image embedding/i);
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// E2E Flow 4: Error & Edge Cases
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — Error handling and edge cases", () => {

  test("rejects non-base64 image in embed-image endpoint", async () => {
    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .send({ imageBase64: "not-a-data-url" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/base64 data URL/i);
  });

  test("rejects empty request body to embed-image", async () => {
    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .send({});

    expect(res.status).toBe(400);
  });

  test("handles Jina API failure during embed-image gracefully", async () => {
    generateImageEmbedding.mockRejectedValue(new Error("Service unavailable"));

    const origError = console.error;
    console.error = vi.fn();

    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .send({ imageBase64: FAKE_BASE64_IMAGE });

    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/Failed to generate/i);

    console.error = origError;
  });

  test("handles invalid type in similarity search", async () => {
    const res = await request(buildApp())
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING, type: "InvalidType" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid type/i);
  });

  test("similarity search with custom limit returns correct count", async () => {
    const items = mockSimilarItemResults(5);
    Item.aggregate = vi.fn().mockResolvedValue(items);

    const res = await request(buildApp())
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  test("multiple sequential searches work independently", async () => {
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);
    const app = buildApp();

    // First search
    Item.aggregate = vi.fn().mockResolvedValue(mockSimilarItemResults(2));
    const search1 = await request(app)
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING, type: "Lost" });

    expect(search1.status).toBe(200);
    expect(search1.body.count).toBe(2);

    // Second search (different results)
    Item.aggregate = vi.fn().mockResolvedValue(mockSimilarItemResults(1));
    const search2 = await request(app)
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING_ALT, type: "Found" });

    expect(search2.status).toBe(200);
    expect(search2.body.count).toBe(1);
  });
});
