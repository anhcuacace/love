import type React from "react";
import { useEffect, useState } from "react";

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

const isBrowser = typeof window !== "undefined";

export const useLocalStorage = <T,>(
  key: string,
  defaultValue: T
): [T, SetValue<T>] => {
  const [value, setValue] = useState<T>(() => {
    if (!isBrowser) return defaultValue;

    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch (error) {
      console.error("Failed to read localStorage", error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to write localStorage", error);
    }
  }, [key, value]);

  return [value, setValue];
};
