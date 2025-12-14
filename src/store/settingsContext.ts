import { createContext, useContext } from "react";

export type Theme = "scrapbook" | "light" | "dark" | "romantic";
export type Language = "vi" | "en";

export type SettingsContextValue = {
  theme: Theme;
  language: Language;
  musicEnabled: boolean;
  startDate: string;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setStartDate: (startDate: string) => void;
  toggleMusic: () => void;
};

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return ctx;
};
