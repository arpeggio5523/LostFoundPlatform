import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translateMessage } from "../services/messagesApi";

export default function MessageTranslation(props) {
  const { language, t } = useLanguage();
  const targetLanguage = language === "zh" ? "zh-CN" : language;
  return <TranslationContent key={JSON.stringify([props.conversationId, props.message._id, props.message.text, targetLanguage])} {...props} targetLanguage={targetLanguage} t={t} />;
}

function TranslationContent({ message, conversationId, isMine, targetLanguage, t }) {
  const [translation, setTranslation] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTranslation = async () => {
    if (loading) return;
    if (translation) {
      setShowTranslation((current) => !current);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await translateMessage(conversationId, message._id, targetLanguage);
      if (!result.translatedText) throw new Error("No translation was returned. Please try again.");
      setTranslation(result);
      setShowTranslation(true);
    } catch (err) {
      setError(err.message || "Translation unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p dir="auto" lang={showTranslation ? translation.targetLanguage : undefined} className="whitespace-pre-wrap break-words">
        {showTranslation ? translation.translatedText : message.text}
      </p>
      <button
        type="button"
        onClick={toggleTranslation}
        disabled={loading}
        aria-pressed={showTranslation}
        className={`mt-1 text-xs underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${isMine ? "text-[var(--color-brand-text)]/80" : "text-[var(--color-brand)]"}`}
      >
        {loading ? t("Translating...") : showTranslation ? t("See original") : t("See translation")}
      </button>
      {error && <p role="alert" className="mt-1 text-xs">{error}</p>}
    </>
  );
}
