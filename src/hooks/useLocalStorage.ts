import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (e) {
      console.warn(`[useLocalStorage] Fehler beim Lesen von "${key}":`, e);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.warn(`[useLocalStorage] Fehler beim Speichern von "${key}":`, e);
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
