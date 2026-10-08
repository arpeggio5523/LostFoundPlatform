import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createTranslator, LANGUAGES, LANGUAGE_STORAGE_KEY, isSupportedLanguage } from "../i18n/translations";

const defaultLanguage = LANGUAGES[0];
const LanguageContext = createContext({
  language: defaultLanguage.code,
  locale: defaultLanguage.locale,
  setLanguage: () => {},
  t: createTranslator(defaultLanguage.code),
});

function readLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(saved) ? saved : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [language, updateLanguage] = useState(readLanguage);

  const setLanguage = useCallback((next) => {
    if (!isSupportedLanguage(next)) return;
    updateLanguage(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-Hans" : language;
  }, [language]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) {
        updateLanguage(isSupportedLanguage(event.newValue) ? event.newValue : "en");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(() => ({
    language,
    locale: LANGUAGES.find((entry) => entry.code === language).locale,
    setLanguage,
    t: createTranslator(language),
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
