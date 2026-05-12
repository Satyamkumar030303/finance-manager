import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);

const FONTS = [
  { id: "Inter", label: "Inter" },
  { id: "Poppins", label: "Poppins" },
  { id: "Manrope", label: "Manrope" },
  { id: "DM Sans", label: "DM Sans" },
  { id: "Outfit", label: "Outfit" },
  { id: "Nunito", label: "Nunito" },
];

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return getSystemTheme();
  });

  const [font, setFontState] = useState(
    () => localStorage.getItem("appFont") || "Inter"
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply font CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--app-font", `"${font}"`);
    localStorage.setItem("appFont", font);
  }, [font]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Listen for system theme changes (when stored pref is "system")
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem("theme")) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setFont = useCallback((f) => setFontState(f), []);
  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    []
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        toggleTheme,
        isDark: theme === "dark",
        font,
        setFont,
        fonts: FONTS,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
