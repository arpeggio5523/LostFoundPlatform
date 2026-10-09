import { Credentials, Translator } from "@translated/lara";

let translator;

const getTranslator = () => {
  if (!process.env.LARA_ACCESS_KEY_ID || !process.env.LARA_ACCESS_KEY_SECRET) {
    const error = new Error("Lara Translate credentials are not configured.");
    error.status = 503;
    throw error;
  }

  if (!translator) {
    translator = new Translator(new Credentials(
      process.env.LARA_ACCESS_KEY_ID,
      process.env.LARA_ACCESS_KEY_SECRET
    ));
  }

  return translator;
};

export async function detectLanguage(text) {
  const query = typeof text === "string" ? text.trim() : "";
  if (!query) throw new Error("Text is required.");

  const result = await getTranslator().detect(query);
  const prediction = result?.predictions?.[0];
  const language = result?.language || prediction?.language;

  if (!language) throw new Error("Lara returned no detected language.");

  return {
    language: language.toLowerCase(),
    confidence: Number.isFinite(prediction?.confidence) ? prediction.confidence : null,
  };
}

