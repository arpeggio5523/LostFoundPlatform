import { useState } from "react";
import { Sun } from "lucide-react";
import NavBar from "../components/NavBar";

function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Settings</h1>

        <div className="rounded-2xl bg-white p-6 shadow">
          {/* Appearance Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
            <p className="text-sm text-gray-500">Customize how the app looks and feels</p>
          </div>

          {/* Toggle Row */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-start gap-3">
              <Sun className="mt-1 h-5 w-5 text-amber-500 animate-pulse" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">Dark Mode</h3>
                <p className="text-sm text-gray-500">Switch between light and dark theme</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                isDarkMode ? 'bg-teal-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
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

