import { type ReactNode, useEffect, useMemo } from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { SettingsContext, type Language, type Theme } from "./settingsContext";

export const SettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [theme, setTheme] = useLocalStorage<Theme>(
    "lovestory:theme",
    "scrapbook"
  );
  const [language, setLanguage] = useLocalStorage<Language>(
    "lovestory:language",
    "vi"
  );
  const [musicEnabled, setMusicEnabled] = useLocalStorage<boolean>(
    "lovestory:music-enabled",
    true
  );
  const [startDate, setStartDate] = useLocalStorage<string>(
    "lovestory:start-date",
    "2022-11-04"
  );

  useEffect(() => {
    const root = document.documentElement;
    const classNames: Theme[] = ["light", "dark", "romantic", "scrapbook"];

    classNames.forEach((variant) => root.classList.remove(`theme-${variant}`));
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      language,
      musicEnabled,
      startDate,
      setTheme,
      setLanguage,
      setStartDate,
      toggleMusic: () => setMusicEnabled((prev) => !prev),
    }),
    [
      language,
      musicEnabled,
      setLanguage,
      setMusicEnabled,
      setStartDate,
      setTheme,
      startDate,
      theme,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};
