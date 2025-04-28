"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: Readonly<ThemeProviderProps>) {
  const [theme, setThemeState] = useState<Theme>("system");

  const setTheme = (theme: Theme) => {
    try {
      if (!["light", "dark", "system"].includes(theme)) {
        theme = "system";
      }

      setThemeState(theme);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      document.cookie = `bookworm-theme=${theme}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        document.documentElement.classList.toggle(
          "dark",
          systemTheme === "dark",
        );
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  };

  useEffect(() => {
    try {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("bookworm-theme="))
        ?.split("=")[1];

      if (cookieValue && ["light", "dark", "system"].includes(cookieValue)) {
        setThemeState(cookieValue as Theme);
      }

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        document.documentElement.classList.toggle(
          "dark",
          systemTheme === "dark",
        );
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (theme === "system") {
          document.documentElement.classList.toggle("dark", mediaQuery.matches);
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch (error) {
      console.error("Error reading theme cookie:", error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
