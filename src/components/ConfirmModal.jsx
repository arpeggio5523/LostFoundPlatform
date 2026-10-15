import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[var(--color-bg-surface)] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-[var(--color-border)] transform scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-2">
            {title}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {message}
          </p>
        </div>
        
        <div className="flex border-t border-[var(--color-border)]">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            {t(cancelText)}
          </button>
          <div className="w-[1px] bg-[var(--color-border)]"></div>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            {t(confirmText)}
          </button>
        </div>
      </div>
    </div>
  );
}
