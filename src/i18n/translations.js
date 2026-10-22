import { catalog } from "./catalog";

export const LANGUAGE_STORAGE_KEY = "lostfound.language";
export const LANGUAGES = Object.freeze([
  { code: "en", name: "English", locale: "en-MY" },
  { code: "zh", name: "中文 (Mandarin)", locale: "zh-CN" },
  { code: "ms", name: "Bahasa Melayu", locale: "ms-MY" },
  { code: "ta", name: "தமிழ் (Tamil)", locale: "ta-MY" },
]);

export const isSupportedLanguage = (code) => LANGUAGES.some((entry) => entry.code === code);

// Translate interface copy only. Names, descriptions, addresses and search terms
// remain in their original language. English is also the fallback for new keys.
export function createTranslator(language) {
  const column = { zh: 0, ms: 1, ta: 2 }[language];
  return (key, values = {}) => {
    if (typeof key !== "string") return key;
    const trimmed = key.trim();
    const translated = Object.hasOwn(catalog, trimmed) ? catalog[trimmed][column] : undefined;
    const template = translated ? key.replace(trimmed, () => translated) : key;
    return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (
      Object.hasOwn(values, name) ? String(values[name]) : match
    ));
  };
}
