import { useEffect, useRef, useState } from "react";
import { Flag, ImagePlus, UserRound, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { MAX_MESSAGE_IMAGE_BYTES, MESSAGE_IMAGE_TYPES } from "../utils/messageAttachments";
import {
  REPORT_CATEGORIES,
  REPORT_DESCRIPTION_MAX,
  REPORT_DESCRIPTION_MIN,
  submitReport,
} from "../services/reportsApi";

const labelClass = "mb-1.5 block text-xs font-medium text-gray-500 dark:text-[var(--color-text-secondary)]";
const fieldClass =
  "w-full rounded-lg border border-gray-200 dark:border-[var(--color-border)] bg-gray-50 dark:bg-[var(--color-bg-raised)] px-3 py-2 text-sm text-gray-900 dark:text-[var(--color-text-primary)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40";

/**
 * Slide-over form for reporting the other participant of a conversation.
 * The reported user is fixed (the "tag") so a report can only target someone
 * the reporter has actually messaged.
 */
export default function ReportUserPanel({ conversationId, reportedUserName, onClose, onSubmitted }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  useEffect(() => () => readerRef.current?.abort(), []);

  const trimmedLength = description.trim().length;
  const canSubmit =
    Boolean(category && evidence) && trimmedLength >= REPORT_DESCRIPTION_MIN && !submitting;

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!MESSAGE_IMAGE_TYPES.includes(file.type)) {
      showToast("Choose a JPEG, PNG, GIF or WebP image.", "error");
      return;
    }
    if (!file.size || file.size > MAX_MESSAGE_IMAGE_BYTES) {
      showToast("Choose an image no larger than 2 MB.", "error");
      return;
    }
    readerRef.current?.abort();
    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = () => setEvidence({ name: file.name, data: reader.result });
    reader.onerror = () => showToast("Could not read this image. Please try again.", "error");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await submitReport({
        conversationId,
        category,
        description: description.trim(),
        evidenceImage: evidence.data,
      });
      showToast("Report submitted. An administrator will review it.", "success");
      onSubmitted?.();
      onClose();
    } catch (error) {
      showToast(error.message || "Failed to submit report", "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={t("Report user")}>
      <button
        type="button"
        aria-label={t("Close")}
        className="absolute inset-0 bg-black/40"
        onClick={() => !submitting && onClose()}
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex h-full w-full max-w-md flex-col bg-white dark:bg-[var(--color-bg-surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--color-border-subtle)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-[var(--color-text-primary)]">
            <Flag size={18} className="text-red-500" />
            {t("Report user")}
          </h2>
          <button
            type="button"
            aria-label={t("Close")}
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[var(--color-bg-raised)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <p className={labelClass}>{t("Reported user")}</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-active-bg)] px-3 py-1.5 text-sm font-medium text-[var(--color-brand)]">
              <UserRound size={14} />
              @{reportedUserName || t("Unknown user")}
            </span>
          </div>

          <div>
            <label htmlFor="report-category" className={labelClass}>{t("Type of misconduct")}</label>
            <select
              id="report-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            >
              <option value="" disabled>{t("Select a type…")}</option>
              {REPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(c)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="report-description" className={labelClass}>{t("Description")}</label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, REPORT_DESCRIPTION_MAX))}
              rows={5}
              placeholder={t("Describe what happened…")}
              className={`${fieldClass} resize-none`}
            />
            <p className="mt-1 text-right text-[11px] text-gray-400">
              {trimmedLength}/{REPORT_DESCRIPTION_MAX}
              {trimmedLength < REPORT_DESCRIPTION_MIN && ` · ${t("minimum")} ${REPORT_DESCRIPTION_MIN}`}
            </p>
          </div>

          <div>
            <p className={labelClass}>{t("Evidence (screenshot)")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={MESSAGE_IMAGE_TYPES.join(",")}
              onChange={handleFile}
              className="hidden"
              aria-label={t("Choose screenshot")}
            />
            {evidence ? (
              <div className="relative">
                <img
                  src={evidence.data}
                  alt={t("Selected screenshot")}
                  className="max-h-56 w-full rounded-lg border border-gray-200 object-contain dark:border-[var(--color-border)]"
                />
                <button
                  type="button"
                  aria-label={t("Remove screenshot")}
                  onClick={() => setEvidence(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-1 rounded-lg border border-dashed border-gray-300 dark:border-[var(--color-border)] px-4 py-6 text-sm text-gray-500 dark:text-[var(--color-text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--color-bg-raised)]"
              >
                <ImagePlus size={22} />
                {t("Upload a screenshot (up to 2 MB)")}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-200 dark:border-[var(--color-border-subtle)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-gray-200 dark:border-[var(--color-border)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-[var(--color-text-primary)]"
          >
            {t("Cancel")}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {submitting ? t("Submitting…") : t("Submit report")}
          </button>
        </div>
      </form>
    </div>
  );
}
