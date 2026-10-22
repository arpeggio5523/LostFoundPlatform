import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import { Sun, Moon, ArrowLeft, EyeOff, Eye, Languages } from "lucide-react";
import { LANGUAGES } from "../i18n/translations";
import Sidebar from "../components/Sidebar";
import NotificationButton from "../components/NotificationButton";
import { useTheme } from "../context/ThemeContext";
import { getAuthUser, setAuthUser } from "../services/authState";
import { apiFetch } from "../services/apiClient";

function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const currentUser = getAuthUser();
  const [privacyMode, setPrivacyMode] = useState(
    currentUser?.privacyMode || false
  );
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const togglePrivacyMode = async () => {
    const next = !privacyMode;
    setPrivacyMode(next); // optimistic UI update
    setSavingPrivacy(true);

    try {
      const res = await apiFetch("/api/users/me/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacyMode: next }),
      });

      if (!res.ok) throw new Error("Failed to update privacy mode");

      const data = await res.json();
      setAuthUser({ ...currentUser, privacyMode: data.privacyMode ?? next });
    } catch (err) {
      console.error(err);
      setPrivacyMode(!next); // revert on failure
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main style={{ marginLeft: isCollapsed ? 70 : 220, flex: 1, padding: "36px 40px" }}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition"
          >
            <ArrowLeft size={18} />
            {t("Back to Profile")}
          </button>
          <NotificationButton />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--color-text-primary)]">
          {t("Settings")}
        </h1>
        <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
          {t("Customize your experience")}
        </p>

        <div className="rounded-2xl bg-[var(--color-bg-surface)] p-6 shadow border border-[var(--color-border)]">
          {/* Appearance Section Header */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{t("Appearance")}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{t("Customize how the app looks and feels")}</p>
          </div>

          {/* Dark Mode Toggle Row */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-6">
            <div className="flex items-start gap-3">
              {isDark
                ? <Moon className="mt-0.5 h-5 w-5 text-[var(--color-brand)]" />
                : <Sun  className="mt-0.5 h-5 w-5 text-amber-500" />
              }
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("Dark Mode")}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{t("Switch between light and dark theme")}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDark
                  ? "bg-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                  : "bg-gray-300 focus:ring-teal-600"
              }`}
              role="switch"
              aria-checked={isDark}
              aria-label={t("Toggle dark mode")}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Privacy Mode Toggle Row — directly below Dark Mode, same card */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-6 mt-6">
            <div className="flex items-start gap-3">
              {privacyMode
                ? <EyeOff className="mt-0.5 h-5 w-5 text-[var(--color-brand)]" />
                : <Eye className="mt-0.5 h-5 w-5 text-[var(--color-text-secondary)]" />
              }
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("Privacy Mode")}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{t("Hide your name — you'll appear as \"Anonymous\" in messages to and from other users")}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={togglePrivacyMode}
              disabled={savingPrivacy}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                privacyMode
                  ? "bg-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                  : "bg-gray-300 focus:ring-teal-600"
              }`}
              role="switch"
              aria-checked={privacyMode}
              aria-label={t("Toggle privacy mode")}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacyMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 mt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Languages className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" aria-hidden="true" />
              <div>
                <label htmlFor="language" className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {t("Language")}
                </label>
                <p id="language-description" className="text-sm text-[var(--color-text-secondary)]">
                  {t("Choose your preferred language for the website.")}
                </p>
              </div>
            </div>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-describedby="language-description"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] sm:w-auto sm:min-w-48"
            >
              {LANGUAGES.map((option) => (
                <option key={option.code} value={option.code} lang={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
