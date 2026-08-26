const DEFAULT_DIMENSIONS = 1024;

export const validateImageEmbedding = (embedding) => {
  const dimensions = Number(process.env.MONGODB_VECTOR_DIMENSIONS || DEFAULT_DIMENSIONS);
  if (!Array.isArray(embedding) || embedding.length !== dimensions) {
    throw new Error(`Image embedding must contain exactly ${dimensions} numbers.`);
  }
  if (!embedding.every((value) => Number.isFinite(value))) {
    throw new Error("Image embedding must contain only finite numbers.");
  }
  return embedding;
};
