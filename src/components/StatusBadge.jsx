import { useLanguage } from "../context/LanguageContext";
import React from "react";

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  const normalizedStatus = status ? status.toLowerCase() : "";

  const styles = {
    approved: "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300",
    pending:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    returned: "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300",
    matched:  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    lost:     "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    found:    "bg-lime-100  text-lime-800  dark:bg-lime-900/40  dark:text-lime-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };

  const currentStyle = styles[normalizedStatus] || "bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:text-gray-300";

  return (
    <span className={`${currentStyle} text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap`}>
      {t(status)}
    </span>
  );
}
