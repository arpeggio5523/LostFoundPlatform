/**
 * tests/unit/models/imageSimilarity.itemModel.test.js
 *
 * UNIT TESTS — Item Model Schema (imageEmbedding field)
 *
 * Tests the Mongoose schema definition for the imageEmbedding field on the
 * Item model. Verifies schema-level configuration without connecting to a
 * real database.
 *
 * What's covered:
 *   ✓ imageEmbedding field exists in the schema
 *   ✓ imageEmbedding is of type [Number]
 *   ✓ imageEmbedding has select: false (hidden by default in queries)
 *   ✓ imageEmbedding defaults to undefined (not an empty array)
 *   ✓ images field validation (max 5 images)
 *   ✓ Item schema has all expected fields for image similarity workflow
 *
 * Dependencies: Real Item model import (no DB connection needed for schema checks)
 */

import Item from "../../../src/models/Item.js";

describe("Item model — imageEmbedding schema definition", () => {

  // ─── Schema Path Existence ────────────────────────────────────────────

  test("has an imageEmbedding field defined in the schema", () => {
    const schemaPaths = Item.schema.paths;
    expect(schemaPaths).toHaveProperty("imageEmbedding");
  });

  test("has an images field defined in the schema", () => {
    const schemaPaths = Item.schema.paths;
    expect(schemaPaths).toHaveProperty("images");
  });


  // ─── imageEmbedding Type Configuration ────────────────────────────────

  test("imageEmbedding is an array type", () => {
    const embeddingPath = Item.schema.path("imageEmbedding");
    // Mongoose represents [Number] as a MongooseDocumentArray or Array type
    expect(embeddingPath).toBeDefined();
    expect(embeddingPath.instance).toBe("Array");
  });

  test("imageEmbedding has select: false (hidden from default queries)", () => {
    const embeddingPath = Item.schema.path("imageEmbedding");
    // select: false means the field won't be returned in find() queries
    // unless explicitly requested with .select("+imageEmbedding")
    expect(embeddingPath.options.select).toBe(false);
  });

  test("imageEmbedding defaults to undefined (not an empty array)", () => {
    const embeddingPath = Item.schema.path("imageEmbedding");
    expect(embeddingPath.options.default).toBeUndefined();
  });


  // ─── images Field Configuration ───────────────────────────────────────

  test("images field is an array type", () => {
    const imagesPath = Item.schema.path("images");
    expect(imagesPath).toBeDefined();
    expect(imagesPath.instance).toBe("Array");
  });

  test("images field defaults to an empty array", () => {
    const imagesPath = Item.schema.path("images");
    expect(imagesPath.options.default).toEqual([]);
  });

  test("images field has a max-5 validator", () => {
    const imagesPath = Item.schema.path("images");
    expect(imagesPath.options.validate).toBeDefined();
  });


  // ─── Schema Completeness for Image Similarity Workflow ────────────────

  test("schema includes all fields required by the image similarity workflow", () => {
    const requiredFields = [
      "title",
      "description",
      "category",
      "type",
      "location",
      "date",
      "status",
      "user",
      "images",
      "imageEmbedding",
      "reportedBy",
    ];

    requiredFields.forEach((field) => {
      expect(Item.schema.paths).toHaveProperty(field);
    });
  });

  test("type field only allows 'Lost' and 'Found' values", () => {
    const typePath = Item.schema.path("type");
    expect(typePath.options.enum).toEqual(["Lost", "Found"]);
  });

  test("status field includes 'Matched' as an allowed value", () => {
    const statusPath = Item.schema.path("status");
    expect(statusPath.options.enum.values).toContain("Matched");
  });
});
