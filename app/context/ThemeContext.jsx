"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * ThemeContext — Windsong Admin
 *
 * Fetches the active theme from the API on mount, applies CSS variables to
 * document.documentElement, and provides runtime theme switching without
 * redeployment.
 */

const DEFAULTS = {
  "--color-primary":    "#6D31ED",
  "--color-secondary":  "#15ABFF",
  "--color-accent":     "#15ABFF",
  "--color-background": "#ffffff",
  "--color-text":       "#1a1a2e",
  "--color-success":    "#8fc5a1",
  "--color-warning":    "#efb034",
  "--color-error":      "#df4247",
  "--font-family":      "'Inter', sans-serif",
};

const ThemeContext = createContext({
  theme: null,
  cssVariables: DEFAULTS,
  isLoading: true,
  applyVariables: () => {},
  refreshTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [cssVariables, setCssVariables] = useState(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);

  const applyVariables = useCallback((variables) => {
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });
  }, []);

  const fetchAndApply = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${baseUrl}/v1/theme`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Theme fetch failed");

      const { data } = await res.json();

      if (data?.css_variables) {
        applyVariables(data.css_variables);
        setCssVariables(data.css_variables);
      }
      if (data?.theme) {
        setTheme(data.theme);
      }
    } catch {
      // Fall back to defaults silently
      applyVariables(DEFAULTS);
    } finally {
      setIsLoading(false);
    }
  }, [applyVariables]);

  // Fetch on mount
  useEffect(() => {
    fetchAndApply();
  }, [fetchAndApply]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        cssVariables,
        isLoading,
        applyVariables,
        refreshTheme: fetchAndApply,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
