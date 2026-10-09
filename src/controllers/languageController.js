import { detectLanguage, translateToEnglish } from "../services/laraTranslate.js";

export const detectQueryLanguage = async (req, res) => {
  const query = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (query.length < 2) {
    return res.status(400).json({ error: "Text must contain at least 2 characters." });
  }

  if (query.length > 500) {
    return res.status(400).json({ error: "Text must not exceed 500 characters." });
  }

  try {
    const detection = await detectLanguage(query);
    return res.status(200).json(detection);
  } catch (error) {
    console.error("Lara language detection error:", error.message);
    const upstreamStatus = error.status ?? error.statusCode;
    return res.status(upstreamStatus === 429 ? 429 : upstreamStatus === 503 ? 503 : 502).json({
      error: "Language detection is temporarily unavailable.",
    });
  }
};

export const translateQueryToEnglish = async (req, res) => {
  const query = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (query.length < 2) {
    return res.status(400).json({ error: "Text must contain at least 2 characters." });
  }

  if (query.length > 500) {
    return res.status(400).json({ error: "Text must not exceed 500 characters." });
  }

  try {
    const translatedText = await translateToEnglish(query);
    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error("Lara query translation error:", error.message);
    const upstreamStatus = error.status ?? error.statusCode;
    return res.status(upstreamStatus === 429 ? 429 : upstreamStatus === 503 ? 503 : 502).json({
      error: "Query translation is temporarily unavailable.",
    });
  }
};
