const MODEL_NAME = process.env.IMAGE_EMBEDDING_MODEL || "Xenova/clip-vit-base-patch32";

let extractorPromise;

const getExtractor = async () => {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers")
      .then(({ pipeline }) => pipeline("image-feature-extraction", MODEL_NAME))
      .catch((error) => {
        extractorPromise = undefined;
        throw new Error(`Unable to load image embedding model: ${error.message}`);
      });
  }
  return extractorPromise;
};

const normalize = (values) => {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) throw new Error("Image embedding is empty.");
  return values.map((value) => value / magnitude);
};

export const createImageEmbedding = async (image) => {
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    throw new Error("A base64 image data URL is required to create an image embedding.");
  }

  const extractor = await getExtractor();
  const output = await extractor(image, { pooling: "mean", normalize: false });
  return normalize(Array.from(output.data));
};

export const createItemImageEmbedding = async (images) => {
  const firstImage = Array.isArray(images) ? images.find(Boolean) : undefined;
  return firstImage ? createImageEmbedding(firstImage) : undefined;
};