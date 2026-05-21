import { Sun, Moon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
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

            {/* Toggle Switch */}
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
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
