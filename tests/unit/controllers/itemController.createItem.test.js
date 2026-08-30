/**
 * Unit tests for createItem (POST /api/items) — "Found" post creation.
 * Location: tests/unit/controllers/
 *
 * All dependencies (Item, User, emailService, embeddings) are mocked —
 * no real DB or network calls. For DB-backed behavior, see the sibling
 * test in tests/integration/routes/.
 */

import request from "supertest";

// ---- Mocks ---------------------------------------------------------------

jest.mock("../../../src/models/Item.js");
jest.mock("../../../src/models/User.js");
jest.mock("../../../src/utils/emailService.js");
jest.mock("../../../src/services/imageEmbedding.js");
jest.mock("../../../src/services/jinaEmbedding.js");

import Item from "../../../src/models/Item.js";
import { validateImageEmbedding } from "../../../src/services/imageEmbedding.js";
import { generateImageEmbedding } from "../../../src/services/jinaEmbedding.js";
import { createItem } from "../../../src/controllers/ItemController.js";
import { buildTestApp, FAKE_USER_ID } from "../../utils/buildTestApp.js";
import { VALID_FOUND_ITEM, mockSavedDoc } from "../../utils/fixtures.js";

const buildApp = () =>
  buildTestApp((app) => app.post("/api/items", createItem));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/items — createItem (Found post)", () => {
  test("creates a Found item successfully and forces status to 'Approved'", async () => {
    const savedDoc = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(savedDoc);
    });

    const res = await request(buildApp())
      .post("/api/items")
      .send(VALID_FOUND_ITEM);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Found item report submitted successfully/);
    expect(res.body.data).toEqual(savedDoc);

    // reportedBy must come from the authenticated user, not the client body
    const constructedPayload = Item.mock.calls[0][0];
    expect(constructedPayload.reportedBy).toBe(FAKE_USER_ID);
    expect(constructedPayload.status).toBe("Approved");
  });

  test.each([
    ["title", { title: undefined }],
    ["description", { description: undefined }],
    ["category", { category: undefined }],
    ["type", { type: undefined }],
    ["location", { location: undefined }],
    ["date", { date: undefined }],
    ["user", { user: undefined }],
  ])("400s when required field '%s' is missing", async (fieldName, override) => {
    const body = { ...VALID_FOUND_ITEM, ...override };
    delete body[fieldName];

    const res = await request(buildApp()).post("/api/items").send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(new RegExp(fieldName));
    expect(Item).not.toHaveBeenCalled();
  });

  test("400s on invalid type", async () => {
    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, type: "Stolen" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid type/);
  });

  test("400s on invalid category", async () => {
    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, category: "Pets" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid category/);
  });

  test("400s on invalid location", async () => {
    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, location: "Random Mall" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid location/);
  });

  test("400s on invalid date", async () => {
    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, date: "not-a-date" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid date format/);
  });

  test("400s when more than 5 images are provided", async () => {
    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: Array(6).fill("https://example.com/img.jpg") });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Maximum of 5 images/);
  });

  test("auto-generates an embedding when the first image is a fresh base64 upload", async () => {
    const savedDoc = mockSavedDoc();
    let constructedInstance;
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(savedDoc);
      constructedInstance = this;
    });
    generateImageEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
    validateImageEmbedding.mockImplementation((v) => v);

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: ["data:image/png;base64,AAAA"] });

    expect(res.status).toBe(201);
    expect(generateImageEmbedding).toHaveBeenCalledWith("data:image/png;base64,AAAA");
    expect(constructedInstance.imageEmbedding).toEqual([0.1, 0.2, 0.3]);
  });

  test("uses a client-supplied embedding instead of auto-generating one", async () => {
    const savedDoc = mockSavedDoc();
    let constructedInstance;
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(savedDoc);
      constructedInstance = this;
    });
    validateImageEmbedding.mockImplementation((v) => v);

    const res = await request(buildApp())
      .post("/api/items")
      .send({
        ...VALID_FOUND_ITEM,
        images: ["data:image/png;base64,AAAA"],
        embedding: [0.9, 0.8],
      });

    expect(res.status).toBe(201);
    expect(generateImageEmbedding).not.toHaveBeenCalled();
    expect(validateImageEmbedding).toHaveBeenCalledWith([0.9, 0.8]);
    expect(constructedInstance.imageEmbedding).toEqual([0.9, 0.8]);
  });

  test("does not attempt embedding generation for URL-only images", async () => {
    const savedDoc = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(savedDoc);
    });

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: ["https://cdn.example.com/existing.jpg"] });

    expect(res.status).toBe(201);
    expect(generateImageEmbedding).not.toHaveBeenCalled();
  });

  test("still saves the item (without a vector) if embedding generation throws", async () => {
    const savedDoc = mockSavedDoc();
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockResolvedValue(savedDoc);
    });
    generateImageEmbedding.mockRejectedValue(new Error("Jina API down"));

    const res = await request(buildApp())
      .post("/api/items")
      .send({ ...VALID_FOUND_ITEM, images: ["data:image/png;base64,AAAA"] });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(savedDoc);
  });

  test("returns 400 with joined messages on a Mongoose ValidationError", async () => {
    const validationError = {
      name: "ValidationError",
      errors: {
        title: { message: "Title is too short" },
        description: { message: "Description is required" },
      },
    };
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockRejectedValue(validationError);
    });

    const res = await request(buildApp())
      .post("/api/items")
      .send(VALID_FOUND_ITEM);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is too short; Description is required");
  });

  test("returns 500 on unexpected save errors", async () => {
    Item.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = jest.fn().mockRejectedValue(new Error("DB connection lost"));
    });

    const res = await request(buildApp())
      .post("/api/items")
      .send(VALID_FOUND_ITEM);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB connection lost");
  });
});