/**
 * tests/setup/imageSimilarity.setup.js
 *
 * Jest setup/teardown configuration for image-similarity test suites.
 *
 * Responsibilities:
 *   1. Save and restore environment variables (JINA_API_KEY, MONGODB_VECTOR_DIMENSIONS)
 *      so tests can freely mutate process.env without leaking across suites.
 *   2. Save and restore global.fetch so mock-fetch tests don't pollute each other.
 *   3. Suppress console.warn/error during tests to keep output clean (while still
 *      capturing calls for assertion).
 *   4. Provide a reusable `setupImageSimilarityEnv()` helper that configures a
 *      known-good test environment for embedding-related tests.
 *
 * Usage:
 *   Import the helpers into any test file:
 *     import { setupImageSimilarityEnv, teardownImageSimilarityEnv } from "../../setup/imageSimilarity.setup.js";
 *
 *   Then in beforeEach/afterEach:
 *     beforeEach(() => setupImageSimilarityEnv());
 *     afterEach(() => teardownImageSimilarityEnv());
 */


// ─── Snapshot of original environment ───────────────────────────────────────

/** Stores original values so we can restore after each test */
let savedEnv = {};
let savedFetch = null;
let savedConsoleWarn = null;
let savedConsoleError = null;

// ─── Environment Variables ──────────────────────────────────────────────────

/**
 * List of environment variables that image-similarity code reads.
 * We snapshot these on setup and restore them on teardown.
 */
const IMAGE_SIMILARITY_ENV_VARS = [
  "JINA_API_KEY",
  "MONGODB_VECTOR_DIMENSIONS",
  "MONGODB_VECTOR_INDEX",
];


// ─── Setup Helper ───────────────────────────────────────────────────────────

/**
 * Configures a clean, known-good environment for image-similarity tests.
 *
 * Call this in `beforeEach()` to ensure each test starts from a consistent state:
 *   - JINA_API_KEY set to a test value
 *   - MONGODB_VECTOR_DIMENSIONS set to 1024 (matching Jina CLIP-v2)
 *   - global.fetch preserved for later restoration
 *   - console.warn/error suppressed (but still available for assertions)
 *
 * @param {object} envOverrides - Optional env var overrides for specific tests
 */
export const setupImageSimilarityEnv = (envOverrides = {}) => {
  // Snapshot current env values
  savedEnv = {};
  IMAGE_SIMILARITY_ENV_VARS.forEach((key) => {
    savedEnv[key] = process.env[key];
  });

  // Snapshot global.fetch
  savedFetch = global.fetch;

  // Snapshot console methods
  savedConsoleWarn = console.warn;
  savedConsoleError = console.error;

  // Set known-good defaults
  process.env.JINA_API_KEY = "test-api-key-12345";
  process.env.MONGODB_VECTOR_DIMENSIONS = "1024";
  process.env.MONGODB_VECTOR_INDEX = "item_image_vector_index";

  // Apply any test-specific overrides
  Object.entries(envOverrides).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });

  // Suppress noisy console output during tests
  // Tests can still assert on these mocks if needed
  console.warn = vi.fn();
  console.error = vi.fn();
};


// ─── Teardown Helper ────────────────────────────────────────────────────────

/**
 * Restores the original environment after each test.
 *
 * Call this in `afterEach()` to prevent env/fetch/console leaks between tests.
 */
export const teardownImageSimilarityEnv = () => {
  // Restore env vars
  IMAGE_SIMILARITY_ENV_VARS.forEach((key) => {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  });

  // Restore global.fetch
  if (savedFetch !== null) {
    global.fetch = savedFetch;
  }

  // Restore console methods
  if (savedConsoleWarn) console.warn = savedConsoleWarn;
  if (savedConsoleError) console.error = savedConsoleError;

  // Clear all Jest mocks
  vi.restoreAllMocks();
};


// ─── Validation Helpers ─────────────────────────────────────────────────────

/**
 * Asserts that the given environment is correctly configured for embedding tests.
 * Useful as a sanity-check inside test suites.
 *
 * @throws {Error} If required env vars are missing
 */
export const assertImageSimilarityEnvReady = () => {
  const required = ["JINA_API_KEY", "MONGODB_VECTOR_DIMENSIONS"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Image similarity test environment is missing required vars: ${missing.join(", ")}. ` +
      `Call setupImageSimilarityEnv() in beforeEach().`
    );
  }
};


// ─── Test Suite Configuration ───────────────────────────────────────────────

/**
 * Returns a Jest-compatible config object for image similarity tests.
 * Can be spread into vi.config.js overrides if needed.
 */
export const imageSimilarityTestConfig = {
  testTimeout: 10000, // 10 seconds — generous for async mock tests
  verbose: true,
};
