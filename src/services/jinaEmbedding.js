/**
 * jinaEmbedding.js
 *
 * Backend service for generating image embeddings via the Jina AI API.
 * Model: jina-clip-v2 (1024-dimensional vectors, cosine similarity)
 * Docs: https://jina.ai/api-dashboard/
 *
 * Usage:
 *   import { generateImageEmbedding } from "./jinaEmbedding.js";
 *   const embedding = await generateImageEmbedding(base64DataUrl);
 *
 * The returned array has exactly MONGODB_VECTOR_DIMENSIONS (default: 1024) numbers.
 * If JINA_API_KEY is missing or the API call fails, an error is thrown —
 * callers should catch and handle gracefully (e.g. skip embedding, log warning).
 */

const JINA_API_URL = "https://api.jina.ai/v1/embeddings";
const JINA_MODEL = "jina-clip-v2";

/**
 * Generate a 1024-dimensional image embedding via Jina AI CLIP-v2.
 *
 * @param {string} imageDataUrlOrUrl - A base64 data URL ("data:image/...;base64,...")
 *   or a publicly accessible image URL.
 * @returns {Promise<number[]>} A 1024-element float array.
 * @throws {Error} If JINA_API_KEY is missing, the API call fails, or the response
 *   is malformed.
 */
export async function generateImageEmbedding(imageDataUrlOrUrl) {
  const apiKey = process.env.JINA_API_KEY;

  if (!apiKey) {
    throw new Error(
      "JINA_API_KEY is not set. Add it to your .env file. " +
        "See documents/vector-search-setup.md for instructions."
    );
  }

  // Jina CLIP-v2 expects images as { "image": "<base64 data URL>" }
  const payload = {
    model: JINA_MODEL,
    input: [
      {
        image: imageDataUrlOrUrl,
      },
    ],
  };

  let response;
  try {
    response = await fetch(JINA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    throw new Error(`Jina AI network error: ${networkErr.message}`);
  }

  if (!response.ok) {
    let body = "";
    try {
      body = await response.text();
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(
      `Jina AI API returned HTTP ${response.status}: ${body || response.statusText}`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    throw new Error(`Jina AI response parse error: ${parseErr.message}`);
  }

  const embedding = data?.data?.[0]?.embedding;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error(
      "Jina AI returned an unexpected response — no embedding found. " +
        `Response: ${JSON.stringify(data)}`
    );
  }

  return embedding;
}
