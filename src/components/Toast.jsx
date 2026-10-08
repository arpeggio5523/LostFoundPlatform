import { useLanguage } from "../context/LanguageContext";
import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto-dismiss after 3.5 seconds
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // wait for exit animation
  };

  const isSuccess = type === "success";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}
        ${isSuccess ? "bg-[var(--color-bg-surface)] border-green-200" : "bg-[var(--color-bg-surface)] border-red-200"}
      `}
      style={{ minWidth: "280px" }}
    >
      {isSuccess ? (
        <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
      ) : (
        <XCircle size={20} className="text-red-500 flex-shrink-0" />
      )}
      
      <p className="text-sm font-semibold text-[var(--color-text-primary)] flex-1">
        {t(message)}
      </p>

      <button
        onClick={handleClose}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
