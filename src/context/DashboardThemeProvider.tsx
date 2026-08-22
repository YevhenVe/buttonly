"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type DashboardTheme = "light" | "dark";

interface DashboardThemeContextValue {
  theme: DashboardTheme;
  toggleTheme: () => void;
  setTheme: (theme: DashboardTheme) => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(
  null,
);

const THEME_STORAGE_KEY = "buttonly_dashboard_theme";

export function DashboardThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<DashboardTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as DashboardTheme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        document.documentElement.setAttribute("data-dashboard-theme", saved);
      } else {
        setThemeState("light");
        document.documentElement.setAttribute("data-dashboard-theme", "light");
      }
    } catch {
      // localStorage might not be available
    }
    setMounted(true);

    return () => {
      document.documentElement.removeAttribute("data-dashboard-theme");
    };
  }, []);

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.setAttribute("data-dashboard-theme", newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <DashboardThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div data-dashboard-theme={mounted ? theme : "light"} style={{ color: "var(--foreground)" }}>
        {children}
      </div>
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme(): DashboardThemeContextValue | null {
  return useContext(DashboardThemeContext);
}
