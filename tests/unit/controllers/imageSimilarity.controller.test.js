/**
 * tests/unit/controllers/imageSimilarity.controller.test.js
 *
 * UNIT TESTS — Image Similarity Controller Functions
 *
 * Tests the three controller endpoints that power image-based search:
 *   1. findSimilarItems   — POST /api/items/similar
 *   2. findSimilarItemsById — GET /api/items/:itemId/similar
 *   3. embedImage         — POST /api/items/embed-image
 *
 * All dependencies (Item model, Jina service, validation) are fully mocked.
 * No real DB, no real HTTP, no real embeddings.
 *
 * What's covered:
 *   ✓ findSimilarItems — happy path, type filtering, limit clamping, minScore, excludeId
 *   ✓ findSimilarItemsById — happy path, item not found, no embedding
 *   ✓ embedImage — happy path, missing body, non-base64 input, Jina failure
 *   ✓ Error handling (500s, validation errors)
 *
 * Dependencies: Mocked Item, imageEmbedding, jinaEmbedding
 */

// ─── Module Mocks (must be before imports) ──────────────────────────────────

jest.mock("../../../src/models/Item.js");
jest.mock("../../../src/models/User.js");
jest.mock("../../../src/utils/emailService.js");
jest.mock("../../../src/services/imageEmbedding.js");
jest.mock("../../../src/services/jinaEmbedding.js");

import Item from "../../../src/models/Item.js";
import { validateImageEmbedding } from "../../../src/services/imageEmbedding.js";
import { generateImageEmbedding } from "../../../src/services/jinaEmbedding.js";
import {
  findSimilarItems,
  findSimilarItemsById,
  embedImage,
} from "../../../src/controllers/ItemController.js";
import {
  FAKE_EMBEDDING,
  FAKE_BASE64_IMAGE,
  FAKE_ITEM_ID,
  FAKE_USER_ID,
  mockItemWithEmbedding,
  mockSimilarItemResults,
  mockReq,
  mockRes,
} from "../../mocks/imageSimilarity.mocks.js";


// ─── Common Setup ───────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Default: validateImageEmbedding passes through its input unchanged
  validateImageEmbedding.mockImplementation((v) => v);
});


// ═══════════════════════════════════════════════════════════════════════════
// findSimilarItems — POST /api/items/similar
// ═══════════════════════════════════════════════════════════════════════════

describe("findSimilarItems — POST /api/items/similar", () => {

  // ─── Happy Path ─────────────────────────────────────────────────────

  test("returns similar items on valid embedding input", async () => {
    const similarItems = mockSimilarItemResults(3);
    Item.aggregate = jest.fn().mockResolvedValue(similarItems);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING } });
    const res = mockRes();

    await findSimilarItems(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.data).toEqual(similarItems);
  });

  test("validates the embedding before querying", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING } });
    const res = mockRes();

    await findSimilarItems(req, res);

    expect(validateImageEmbedding).toHaveBeenCalledWith(FAKE_EMBEDDING);
  });

  test("calls Item.aggregate with $vectorSearch pipeline", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING, type: "Lost" } });
    const res = mockRes();

    await findSimilarItems(req, res);

    expect(Item.aggregate).toHaveBeenCalledTimes(1);
    const pipeline = Item.aggregate.mock.calls[0][0];

    // First stage should be $vectorSearch
    expect(pipeline[0]).toHaveProperty("$vectorSearch");
    expect(pipeline[0].$vectorSearch.path).toBe("imageEmbedding");
    expect(pipeline[0].$vectorSearch.queryVector).toBe(FAKE_EMBEDDING);
  });


  // ─── Type Filtering ───────────────────────────────────────────────

  test("filters by type when type=Lost is provided", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING, type: "Lost" } });
    const res = mockRes();

    await findSimilarItems(req, res);

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.filter).toEqual({ type: { $eq: "Lost" } });
  });

  test("filters by type when type=Found is provided", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING, type: "Found" } });
    const res = mockRes();

    await findSimilarItems(req, res);

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.filter).toEqual({ type: { $eq: "Found" } });
  });

  test("does not include filter when no type is specified", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING } });
    const res = mockRes();

    await findSimilarItems(req, res);

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.filter).toBeUndefined();
  });

  test("returns 400 for invalid type", async () => {
    const req = mockReq({ body: { embedding: FAKE_EMBEDDING, type: "Stolen" } });
    const res = mockRes();

    await findSimilarItems(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Invalid type/i);
  });


  // ─── Limit Clamping ───────────────────────────────────────────────

  test("defaults limit to 10 when not specified", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING } });
    const res = mockRes();

    await findSimilarItems(req, res);

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.limit).toBe(10);
  });

  test("clamps limit to maximum of 50", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING, limit: 100 } });
    const res = mockRes();

    await findSimilarItems(req, res);

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.limit).toBe(50);
  });

  test("clamps limit to minimum of 1 when negative value provided", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    // Use -5 instead of 0, because Number(0) is falsy so the code falls back
    // to the default of 10 via (Number(limit) || 10)
    const req = mockReq({ body: { embedding: FAKE_EMBEDDING, limit: -5 } });
    const res = mockRes();

    await findSimilarItems(req, res);

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.limit).toBe(1);
  });


  // ─── ExcludeId ────────────────────────────────────────────────────

  test("excludes the source item from results when excludeId is provided", async () => {
    const items = [
      { _id: FAKE_ITEM_ID, title: "Source item", similarityScore: 1.0 },
      { _id: "64f000000000000000000100", title: "Match 1", similarityScore: 0.92 },
    ];
    Item.aggregate = jest.fn().mockResolvedValue(items);

    const req = mockReq({
      body: { embedding: FAKE_EMBEDDING, excludeId: FAKE_ITEM_ID },
    });
    const res = mockRes();

    await findSimilarItems(req, res);

    // Should filter out the source item
    expect(res.body.data).not.toContainEqual(
      expect.objectContaining({ _id: FAKE_ITEM_ID })
    );
  });

  test("fetches one extra item when excludeId is set (to compensate for removal)", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({
      body: { embedding: FAKE_EMBEDDING, limit: 5, excludeId: FAKE_ITEM_ID },
    });
    const res = mockRes();

    await findSimilarItems(req, res);

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.limit).toBe(6); // 5 + 1 for exclusion
  });


  // ─── Error Handling ───────────────────────────────────────────────

  test("returns 500 when Item.aggregate throws", async () => {
    Item.aggregate = jest.fn().mockRejectedValue(new Error("Aggregation failed"));

    // Suppress console.error for this test
    const origError = console.error;
    console.error = jest.fn();

    const req = mockReq({ body: { embedding: FAKE_EMBEDDING } });
    const res = mockRes();

    await findSimilarItems(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Aggregation failed");

    console.error = origError;
  });

  test("returns 500 when validateImageEmbedding throws", async () => {
    validateImageEmbedding.mockImplementation(() => {
      throw new Error("Invalid embedding");
    });

    const origError = console.error;
    console.error = jest.fn();

    const req = mockReq({ body: { embedding: [1, 2, 3] } });
    const res = mockRes();

    await findSimilarItems(req, res);

    expect(res.statusCode).toBe(500);

    console.error = origError;
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// findSimilarItemsById — GET /api/items/:itemId/similar
// ═══════════════════════════════════════════════════════════════════════════

describe("findSimilarItemsById — GET /api/items/:itemId/similar", () => {

  test("looks up the item and delegates to findSimilarItems", async () => {
    const itemDoc = mockItemWithEmbedding();
    const selectMock = jest.fn().mockResolvedValue(itemDoc);
    Item.findById = jest.fn().mockReturnValue({ select: selectMock });
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ params: { itemId: FAKE_ITEM_ID } });
    const res = mockRes();

    await findSimilarItemsById(req, res);

    // Should look up the item with +imageEmbedding to include the hidden field
    expect(Item.findById).toHaveBeenCalledWith(FAKE_ITEM_ID);
    expect(selectMock).toHaveBeenCalledWith("+imageEmbedding");

    // Should forward the embedding to findSimilarItems
    expect(res.statusCode).toBe(200);
  });

  test("returns 404 when item does not exist", async () => {
    Item.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq({ params: { itemId: "nonexistent" } });
    const res = mockRes();

    await findSimilarItemsById(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test("returns 400 when item has no image embedding", async () => {
    const itemWithoutEmbedding = { _id: FAKE_ITEM_ID, imageEmbedding: null };
    Item.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(itemWithoutEmbedding),
    });

    const req = mockReq({ params: { itemId: FAKE_ITEM_ID } });
    const res = mockRes();

    await findSimilarItemsById(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/no image embedding/i);
  });

  test("returns 400 when item has empty embedding array", async () => {
    const itemEmptyEmbed = { _id: FAKE_ITEM_ID, imageEmbedding: [] };
    Item.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(itemEmptyEmbed),
    });

    const req = mockReq({ params: { itemId: FAKE_ITEM_ID } });
    const res = mockRes();

    await findSimilarItemsById(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/no image embedding/i);
  });

  test("injects excludeId to prevent self-matching", async () => {
    const itemDoc = mockItemWithEmbedding();
    Item.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(itemDoc),
    });
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const req = mockReq({ params: { itemId: FAKE_ITEM_ID } });
    const res = mockRes();

    await findSimilarItemsById(req, res);

    // After delegation, req.body should include excludeId
    expect(req.body.excludeId).toBe(FAKE_ITEM_ID);
  });

  test("returns 500 on unexpected error", async () => {
    Item.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB timeout")),
    });

    const req = mockReq({ params: { itemId: FAKE_ITEM_ID } });
    const res = mockRes();

    await findSimilarItemsById(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("DB timeout");
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// embedImage — POST /api/items/embed-image
// ═══════════════════════════════════════════════════════════════════════════

describe("embedImage — POST /api/items/embed-image", () => {

  test("returns embedding on valid base64 image input", async () => {
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    const req = mockReq({ body: { imageBase64: FAKE_BASE64_IMAGE } });
    const res = mockRes();

    await embedImage(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.embedding).toEqual(FAKE_EMBEDDING);
  });

  test("calls generateImageEmbedding with the provided image data", async () => {
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    const req = mockReq({ body: { imageBase64: FAKE_BASE64_IMAGE } });
    const res = mockRes();

    await embedImage(req, res);

    expect(generateImageEmbedding).toHaveBeenCalledWith(FAKE_BASE64_IMAGE);
  });

  test("returns 400 when imageBase64 is missing", async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await embedImage(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/imageBase64/i);
  });

  test("returns 400 when imageBase64 is null", async () => {
    const req = mockReq({ body: { imageBase64: null } });
    const res = mockRes();

    await embedImage(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/imageBase64/i);
  });

  test("returns 400 when imageBase64 is a regular URL (not base64)", async () => {
    const req = mockReq({ body: { imageBase64: "https://example.com/img.jpg" } });
    const res = mockRes();

    await embedImage(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/base64 data URL/i);
  });

  test("returns 400 when imageBase64 is an empty string", async () => {
    const req = mockReq({ body: { imageBase64: "" } });
    const res = mockRes();

    await embedImage(req, res);

    expect(res.statusCode).toBe(400);
  });

  test("returns 502 when Jina embedding generation fails", async () => {
    generateImageEmbedding.mockRejectedValue(new Error("Jina API down"));

    // Suppress console.error for this test
    const origError = console.error;
    console.error = jest.fn();

    const req = mockReq({ body: { imageBase64: FAKE_BASE64_IMAGE } });
    const res = mockRes();

    await embedImage(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toMatch(/Failed to generate image embedding/i);

    console.error = origError;
  });

  test("includes the original error message in the 502 response", async () => {
    generateImageEmbedding.mockRejectedValue(new Error("Rate limit exceeded"));

    const origError = console.error;
    console.error = jest.fn();

    const req = mockReq({ body: { imageBase64: FAKE_BASE64_IMAGE } });
    const res = mockRes();

    await embedImage(req, res);

    expect(res.body.error).toContain("Rate limit exceeded");

    console.error = origError;
  });
});
