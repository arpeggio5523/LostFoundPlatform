import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Initialise from localStorage, defaulting to light
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Keep <html class="dark"> and localStorage in sync whenever isDark changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
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
