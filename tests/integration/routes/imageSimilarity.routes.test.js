/**
 * tests/integration/routes/imageSimilarity.routes.test.js
 *
 * INTEGRATION TESTS — Image Similarity API Routes
 *
 * Tests the Express routes for image similarity as a black box:
 * real HTTP requests → real Express router → mocked controllers/services.
 *
 * Unlike unit tests (which test individual functions), these tests
 * verify the full request lifecycle:
 *   - Route registration and HTTP method matching
 *   - Request body parsing (JSON, limits)
 *   - Auth middleware stubbing (buildTestApp injects req.user)
 *   - Controller integration with the route layer
 *   - Response status codes and body shapes
 *
 * What's covered:
 *   ✓ POST /api/items/embed-image — embedding proxy endpoint
 *   ✓ POST /api/items/similar     — vector similarity search
 *   ✓ POST /api/items             — create item with auto-embedding
 *   ✓ Route-level validation (missing fields, bad inputs)
 *   ✓ Error propagation through the route chain
 *
 * Dependencies: supertest, mocked Item/User/services
 */

import request from "supertest";

// ─── Module Mocks ───────────────────────────────────────────────────────────

jest.mock("../../../src/models/Item.js");
jest.mock("../../../src/models/User.js");
jest.mock("../../../src/utils/emailService.js");
jest.mock("../../../src/services/imageEmbedding.js");
jest.mock("../../../src/services/jinaEmbedding.js");

import Item from "../../../src/models/Item.js";
import { validateImageEmbedding } from "../../../src/services/imageEmbedding.js";
import { generateImageEmbedding } from "../../../src/services/jinaEmbedding.js";
import { buildTestApp } from "../../utils/buildTestApp.js";
import {
  createItem,
  findSimilarItems,
  embedImage,
} from "../../../src/controllers/ItemController.js";
import {
  FAKE_EMBEDDING,
  FAKE_BASE64_IMAGE,
  FAKE_URL_IMAGE,
  mockSimilarItemResults,
} from "../../mocks/imageSimilarity.mocks.js";
import { VALID_FOUND_ITEM, mockSavedDoc } from "../../utils/fixtures.js";


// ─── App Builder ────────────────────────────────────────────────────────────

/**
 * Builds a minimal Express app with all three image-similarity routes mounted.
 * Auth is stubbed via buildTestApp (req.user is always set).
 */
const buildApp = () =>
  buildTestApp((app) => {
    app.post("/api/items/embed-image", embedImage);
    app.post("/api/items/similar", findSimilarItems);
    app.post("/api/items", createItem);
  });


// ─── Common Setup ───────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  validateImageEmbedding.mockImplementation((v) => v);
});


// ═══════════════════════════════════════════════════════════════════════════
// POST /api/items/embed-image — Embedding Proxy
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/items/embed-image — integration", () => {

  test("returns 200 with embedding on valid base64 image", async () => {
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .send({ imageBase64: FAKE_BASE64_IMAGE });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("embedding");
    expect(res.body.embedding).toEqual(FAKE_EMBEDDING);
  });

  test("returns 400 when imageBase64 is missing from request body", async () => {
    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/imageBase64/i);
  });

  test("returns 400 when imageBase64 is a regular URL", async () => {
    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .send({ imageBase64: FAKE_URL_IMAGE });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/base64 data URL/i);
  });

  test("returns 502 when Jina API call fails", async () => {
    generateImageEmbedding.mockRejectedValue(new Error("Jina timeout"));

    // Suppress console.error
    const origError = console.error;
    console.error = jest.fn();

    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .send({ imageBase64: FAKE_BASE64_IMAGE });

    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/Failed to generate image embedding/i);

    console.error = origError;
  });

  test("accepts request with Content-Type application/json", async () => {
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    const res = await request(buildApp())
      .post("/api/items/embed-image")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ imageBase64: FAKE_BASE64_IMAGE }));

    expect(res.status).toBe(200);
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// POST /api/items/similar — Vector Similarity Search
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/items/similar — integration", () => {

  test("returns 200 with matching items on valid embedding", async () => {
    const results = mockSimilarItemResults(2);
    Item.aggregate = jest.fn().mockResolvedValue(results);

    const res = await request(buildApp())
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING, type: "Found" });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  test("returns 200 with empty data when no similar items found", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    const res = await request(buildApp())
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  test("returns 400 for invalid type parameter", async () => {
    const res = await request(buildApp())
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING, type: "Stolen" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid type/i);
  });

  test("passes limit parameter through to the aggregation pipeline", async () => {
    Item.aggregate = jest.fn().mockResolvedValue([]);

    await request(buildApp())
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING, limit: 5 });

    const pipeline = Item.aggregate.mock.calls[0][0];
    expect(pipeline[0].$vectorSearch.limit).toBe(5);
  });

  test("returns 500 when aggregation pipeline throws", async () => {
    Item.aggregate = jest.fn().mockRejectedValue(new Error("Atlas error"));

    const origError = console.error;
    console.error = jest.fn();

    const res = await request(buildApp())
      .post("/api/items/similar")
      .send({ embedding: FAKE_EMBEDDING });

    expect(res.status).toBe(500);

    console.error = origError;
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// POST /api/items — Create Item with Auto-Embedding
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/items — auto-embedding integration", () => {

  test("auto-generates embedding when first image is base64", async () => {
    const saved = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(saved);
    });
    generateImageEmbedding.mockResolvedValue(FAKE_EMBEDDING);

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: [FAKE_BASE64_IMAGE] });

    expect(res.status).toBe(201);
    expect(generateImageEmbedding).toHaveBeenCalledWith(FAKE_BASE64_IMAGE);
  });

  test("skips embedding generation for URL-only images", async () => {
    const saved = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(saved);
    });

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: [FAKE_URL_IMAGE] });

    expect(res.status).toBe(201);
    expect(generateImageEmbedding).not.toHaveBeenCalled();
  });

  test("uses client-supplied embedding over auto-generation", async () => {
    const saved = mockSavedDoc();
    let instance;
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(saved);
      instance = this;
    });
    validateImageEmbedding.mockImplementation((v) => v);

    const clientEmbedding = Array(1024).fill(0.77);
    const res = await request(buildApp())
      .post("/api/items")
      .send({
        ...VALID_FOUND_ITEM,
        images: [FAKE_BASE64_IMAGE],
        embedding: clientEmbedding,
      });

    expect(res.status).toBe(201);
    expect(generateImageEmbedding).not.toHaveBeenCalled();
    expect(instance.imageEmbedding).toEqual(clientEmbedding);
  });

  test("item saves successfully even if embedding generation fails", async () => {
    const saved = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(saved);
    });
    generateImageEmbedding.mockRejectedValue(new Error("Jina down"));

    // Suppress console.warn from autoGenerateEmbedding
    const origWarn = console.warn;
    console.warn = jest.fn();

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: [FAKE_BASE64_IMAGE] });

    expect(res.status).toBe(201);

    console.warn = origWarn;
  });
});
