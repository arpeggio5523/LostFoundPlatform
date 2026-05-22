import { createContext, useContext, useLayoutEffect, useState } from "react";
import { getCurrentUserId } from "../services/authState";

const ThemeContext = createContext(null);

/** Returns the localStorage key for a given user ID (or null for guest). */
function themeKey(userId) {
  return userId ? `theme_${userId}` : null;
}

/**
 * Synchronously apply the correct <html> class BEFORE the first paint.
 * - No logged-in user  → always light (removes "dark")
 * - Logged-in user     → use their saved preference
 *
 * This IIFE runs at module-import time so there is zero flash of wrong theme.
 */
(function applyThemeImmediately() {
  const userId = getCurrentUserId();
  if (!userId) {
    // Guest / unauthenticated: always light
    document.documentElement.classList.remove("dark");
    return;
  }
  const saved = localStorage.getItem(themeKey(userId));
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
})();

/**
 * Returns the correct initial isDark value.
 * - No logged-in user → false (light)
 * - Logged-in user    → their saved preference
 */
function resolveInitialDark() {
  const userId = getCurrentUserId();
  if (!userId) return false; // guest → always light
  const saved = localStorage.getItem(themeKey(userId));
  return saved === "dark";
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(resolveInitialDark);

  // useLayoutEffect fires synchronously after DOM mutations but before paint,
  // so the class is always correct before the user sees anything.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Persist only when a user is logged in
    const userId = getCurrentUserId();
    const key = themeKey(userId);
    if (key) {
      localStorage.setItem(key, isDark ? "dark" : "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  /**
   * Call this after a user logs in to restore their saved theme preference.
   * @param {string} userId  - the ID of the user who just logged in
   */
  const loadUserTheme = (userId) => {
    const saved = localStorage.getItem(themeKey(userId));
    setIsDark(saved === "dark");
  };

  /**
   * Call this when the user logs out.
   * Immediately reverts the UI to light mode (guest default).
   */
  const resetTheme = () => {
    setIsDark(false);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, loadUserTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Convenience hook — use anywhere in the app */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
