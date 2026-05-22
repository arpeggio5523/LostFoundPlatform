import { useEffect } from "react";
import LostFoundHero from "../components/LostFoundHero";
import NavBar from "../components/NavBar";
import { getCurrentUserId } from "../services/authState";

export default function Home() {
  useEffect(() => {
    const root = document.documentElement;

    // Home page is always light — remove dark class immediately
    root.classList.remove("dark");

    return () => {
      // When navigating away from Home, restore the logged-in user's preference
      // (so authenticated pages reflect the user's chosen theme)
      const userId = getCurrentUserId();
      if (userId) {
        const saved = localStorage.getItem(`theme_${userId}`);
        if (saved === "dark") {
          root.classList.add("dark");
        }
      }
      // If no user is logged in, leave it as light (already removed above)
    };
  }, []);

  return (
    <div>
      <NavBar />
      <LostFoundHero />
    </div>
  );
}