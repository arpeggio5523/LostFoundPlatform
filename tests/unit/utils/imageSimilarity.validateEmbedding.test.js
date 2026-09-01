/**
 * tests/unit/utils/imageSimilarity.validateEmbedding.test.js
 *
 * UNIT TESTS — validateImageEmbedding (services/imageEmbedding.js)
 *
 * These tests exercise the pure validation logic that checks whether
 * an embedding vector has the correct shape and content before it is
 * stored in MongoDB or used in a vector-search query.
 *
 * What's covered:
 *   ✓ Happy path — valid embedding accepted
 *   ✓ Dimension mismatch (too short, too long, empty)
 *   ✓ Non-array inputs (string, number, null, undefined, object)
 *   ✓ Non-finite values (NaN, Infinity, -Infinity)
 *   ✓ Custom dimension override via MONGODB_VECTOR_DIMENSIONS env var
 *   ✓ Edge cases (negative numbers, very small floats, mixed int/float)
 *
 * Dependencies: NONE (pure function, no mocks needed)
 */

import { validateImageEmbedding } from "../../../src/services/imageEmbedding.js";

describe("validateImageEmbedding — input validation", () => {

  // ─── Setup ──────────────────────────────────────────────────────────────

  /** Store original env so we can restore after each test */
  const originalDimensions = process.env.MONGODB_VECTOR_DIMENSIONS;

  beforeEach(() => {
    // Reset to default 1024 dimensions for each test
    process.env.MONGODB_VECTOR_DIMENSIONS = "1024";
  });

  afterEach(() => {
    // Restore original env value to avoid leaking between suites
    if (originalDimensions === undefined) {
      delete process.env.MONGODB_VECTOR_DIMENSIONS;
    } else {
      process.env.MONGODB_VECTOR_DIMENSIONS = originalDimensions;
    }
  });


  // ─── Happy Path Tests ─────────────────────────────────────────────────

  test("accepts a valid 1024-element float array and returns the same reference", () => {
    const valid = Array(1024).fill(0.5);
    const result = validateImageEmbedding(valid);

    // Should return the exact same array reference (no cloning)
    expect(result).toBe(valid);
    expect(result.length).toBe(1024);
  });

  test("accepts an embedding with all zeros", () => {
    const zeros = Array(1024).fill(0);
    expect(() => validateImageEmbedding(zeros)).not.toThrow();
  });

  test("accepts an embedding with negative values", () => {
    const negatives = Array(1024).fill(-0.99);
    const result = validateImageEmbedding(negatives);
    expect(result).toBe(negatives);
  });

  test("accepts an embedding with very small float values", () => {
    const tiny = Array(1024).fill(1e-15);
    expect(() => validateImageEmbedding(tiny)).not.toThrow();
  });

  test("accepts an embedding with mixed integer and float values", () => {
    const mixed = Array(1024).fill(0).map((_, i) => (i % 2 === 0 ? 1 : 0.5));
    expect(() => validateImageEmbedding(mixed)).not.toThrow();
  });


  // ─── Dimension Mismatch Tests ─────────────────────────────────────────

  test("rejects an empty array", () => {
    expect(() => validateImageEmbedding([])).toThrow(/must contain exactly 1024/i);
  });

  test("rejects an array that is too short (10 elements)", () => {
    const tooShort = Array(10).fill(0.5);
    expect(() => validateImageEmbedding(tooShort)).toThrow(/must contain exactly 1024/i);
  });

  test("rejects an array that is too long (2048 elements)", () => {
    const tooLong = Array(2048).fill(0.5);
    expect(() => validateImageEmbedding(tooLong)).toThrow(/must contain exactly 1024/i);
  });

  test("rejects an array off by one (1023 elements)", () => {
    const offByOne = Array(1023).fill(0.5);
    expect(() => validateImageEmbedding(offByOne)).toThrow(/must contain exactly 1024/i);
  });

  test("rejects an array off by one (1025 elements)", () => {
    const offByOne = Array(1025).fill(0.5);
    expect(() => validateImageEmbedding(offByOne)).toThrow(/must contain exactly 1024/i);
  });


  // ─── Non-Array Input Tests ────────────────────────────────────────────

  test("rejects a string value", () => {
    expect(() => validateImageEmbedding("not an array")).toThrow(/must contain exactly/i);
  });

  test("rejects a number value", () => {
    expect(() => validateImageEmbedding(42)).toThrow(/must contain exactly/i);
  });

  test("rejects null", () => {
    expect(() => validateImageEmbedding(null)).toThrow(/must contain exactly/i);
  });

  test("rejects undefined", () => {
    expect(() => validateImageEmbedding(undefined)).toThrow(/must contain exactly/i);
  });

  test("rejects a plain object", () => {
    expect(() => validateImageEmbedding({ length: 1024 })).toThrow(/must contain exactly/i);
  });

  test("rejects a boolean", () => {
    expect(() => validateImageEmbedding(true)).toThrow(/must contain exactly/i);
  });


  // ─── Non-Finite Value Tests ───────────────────────────────────────────

  test("rejects an embedding containing NaN", () => {
    const withNaN = Array(1024).fill(0.5);
    withNaN[42] = NaN;
    expect(() => validateImageEmbedding(withNaN)).toThrow(/finite numbers/i);
  });

  test("rejects an embedding containing Infinity", () => {
    const withInf = Array(1024).fill(0.5);
    withInf[0] = Infinity;
    expect(() => validateImageEmbedding(withInf)).toThrow(/finite numbers/i);
  });

  test("rejects an embedding containing -Infinity", () => {
    const withNegInf = Array(1024).fill(0.5);
    withNegInf[999] = -Infinity;
    expect(() => validateImageEmbedding(withNegInf)).toThrow(/finite numbers/i);
  });

  test("rejects an embedding containing a string element", () => {
    const withString = Array(1024).fill(0.5);
    withString[100] = "oops";
    expect(() => validateImageEmbedding(withString)).toThrow(/finite numbers/i);
  });


  // ─── Environment Override Tests ───────────────────────────────────────

  test("respects MONGODB_VECTOR_DIMENSIONS=512 override", () => {
    process.env.MONGODB_VECTOR_DIMENSIONS = "512";
    const valid512 = Array(512).fill(0.1);
    const result = validateImageEmbedding(valid512);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(512);
  });

  test("rejects a 1024 array when dimensions are set to 512", () => {
    process.env.MONGODB_VECTOR_DIMENSIONS = "512";
    const wrong = Array(1024).fill(0.1);
    expect(() => validateImageEmbedding(wrong)).toThrow(/must contain exactly 512/i);
  });

  test("falls back to 1024 when MONGODB_VECTOR_DIMENSIONS is unset", () => {
    delete process.env.MONGODB_VECTOR_DIMENSIONS;
    const valid = Array(1024).fill(0.5);
    expect(() => validateImageEmbedding(valid)).not.toThrow();
  });

  test("falls back to 1024 when MONGODB_VECTOR_DIMENSIONS is empty string", () => {
    process.env.MONGODB_VECTOR_DIMENSIONS = "";
    const valid = Array(1024).fill(0.5);
    // "" is falsy in JS, so ("" || 1024) → 1024, meaning 1024 dimensions are expected
    const result = validateImageEmbedding(valid);
    expect(result).toBe(valid);
  });
});
