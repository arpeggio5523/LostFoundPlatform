import { useState } from "react";
import { Sun, Moon, ArrowLeft, EyeOff, Eye } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { getAuthUser, setAuthUser } from "../services/authState";
import { apiFetch } from "../services/apiClient";

function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  const currentUser = getAuthUser();
  const [privacyMode, setPrivacyMode] = useState(
    currentUser?.privacyMode || false
  );
  const [savingPrivacy, setSavingPrivacy] = useState(false);

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
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition"
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
          Customize your experience
        </p>

        <div className="rounded-2xl bg-[var(--color-bg-surface)] p-6 shadow border border-[var(--color-border)]">
          {/* Appearance Section Header */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              Appearance
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Customize how the app looks and feels
            </p>
          </div>

          {/* Dark Mode Toggle Row */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-6">
            <div className="flex items-start gap-3">
              {isDark
                ? <Moon className="mt-0.5 h-5 w-5 text-[var(--color-brand)]" />
                : <Sun  className="mt-0.5 h-5 w-5 text-amber-500" />
              }
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Dark Mode
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Switch between light and dark theme
                </p>
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
              aria-label="Toggle dark mode"
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
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Privacy Mode
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Hide your name — you'll appear as "Anonymous" in messages
                  to and from other users
                </p>
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
              aria-label="Toggle privacy mode"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacyMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;