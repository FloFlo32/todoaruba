"use client";

import * as React from "react";
import { brand } from "@/brand.config";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

/**
 * Inline script injected into <head> to set the theme BEFORE first paint.
 * This is what prevents the white→dark "flash" on load. Keep it dependency-free.
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(!t){t='${brand.theme.defaultScheme}';}if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

/** Read + toggle the theme. Persists to localStorage. */
export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(brand.theme.defaultScheme);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const toggle = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
