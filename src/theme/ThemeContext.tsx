import React, { createContext, useContext, useState, useMemo } from "react";
import { useColorScheme } from "react-native";

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  accent: string;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  background: "#F2F2F7",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6C6C70",
  border: "#D1D1D6",
  accent: "#007AFF",
  isDark: false,
};

const darkColors: ThemeColors = {
  background: "#000000",
  card: "#1C1C1E",
  text: "#FFFFFF",
  subtext: "#8E8E93",
  border: "#38383A",
  accent: "#0A84FF",
  isDark: true,
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

  const isDark = overrideDark !== null ? overrideDark : systemScheme === "dark";

  const toggleTheme = () => {
    setOverrideDark((prev) => (prev !== null ? !prev : !isDark));
  };

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
