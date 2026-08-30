/**
 * unit/utils/imageEmbedding.test.js
 * Converted from node:test to Jest.
 *
 * Tests validateImageEmbedding (services/imageEmbedding.js).
 */

import { validateImageEmbedding } from "../../../src/services/imageEmbedding.js";

describe("imageEmbedding — validateImageEmbedding", () => {
  beforeEach(() => {
    process.env.MONGODB_VECTOR_DIMENSIONS = "1024";
  });

  test("accepts a valid 1024-element float array", () => {
    const valid = Array(1024).fill(0.5);
    const result = validateImageEmbedding(valid);
    expect(result).toBe(valid); // same array reference
  });

  test("rejects a non-array value", () => {
    expect(() => validateImageEmbedding("not an array")).toThrow(/must contain exactly/i);
  });

  test("rejects wrong-length array", () => {
    const tooShort = Array(10).fill(0.5);
    expect(() => validateImageEmbedding(tooShort)).toThrow(/must contain exactly 1024/i);
  });

  test("rejects array with non-finite values (NaN)", () => {
    const withNaN = Array(1024).fill(0.5);
    withNaN[42] = NaN;
    expect(() => validateImageEmbedding(withNaN)).toThrow(/finite numbers/i);
  });

  test("rejects array with Infinity", () => {
    const withInf = Array(1024).fill(0.5);
    withInf[0] = Infinity;
    expect(() => validateImageEmbedding(withInf)).toThrow(/finite numbers/i);
  });

  test("respects MONGODB_VECTOR_DIMENSIONS env override", () => {
    process.env.MONGODB_VECTOR_DIMENSIONS = "512";
    const valid512 = Array(512).fill(0.1);
    const result = validateImageEmbedding(valid512);
    expect(Array.isArray(result)).toBe(true);
    process.env.MONGODB_VECTOR_DIMENSIONS = "1024"; // reset
  });
});