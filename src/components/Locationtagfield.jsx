import { useLanguage } from "../context/LanguageContext";
import React, { useState } from "react";
import LocationPicker from "./Locationpicker";

export default function LocationTagField({ value, onChange, error }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">{t("Location Tag ")}<span className="text-red-500">*</span>
      </label>

      {value?.coordinates ? (
        <div
          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border ${
            error ? "border-red-400" : "border-[var(--color-border)]"
          } bg-[var(--color-bg-raised)]`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 text-[var(--color-brand)]"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-sm text-[var(--color-text-primary)] truncate">
              {value.formattedAddress ||
                `${value.coordinates[1].toFixed(5)}, ${value.coordinates[0].toFixed(5)}`}
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
            >{t("Change")}</button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
            >{t("Remove")}</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`w-full px-3.5 py-2.5 rounded-lg border border-dashed ${
            error ? "border-red-400" : "border-[var(--color-border)]"
          } bg-[var(--color-bg-raised)] text-sm text-[var(--color-text-muted)] hover:border-gray-400 transition-colors cursor-pointer text-left`}
        >{t("+ Tag location on map")}</button>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{t(error)}</p>}

      {open && (
        <LocationPicker
          initialLocation={value}
          onConfirm={(loc) => {
            onChange(loc);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
