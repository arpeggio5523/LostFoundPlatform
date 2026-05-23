import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export function useForceLightMode() {
  const { setForceLight } = useTheme();

  useEffect(() => {
    setForceLight(true);
    return () => setForceLight(false);
  }, [setForceLight]);
}
