import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { useLocalSearchParams } from "expo-router";

/** The three backgrounds. Every Glacia `isDark` prop derives from it. */
export type BackdropMode = 'dark' | 'light' | 'image';

interface BackdropState {
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const BackdropContext = createContext<BackdropState | null>(null);

export function BackdropProvider({ children }: { children: ReactNode }) {
  // The host (template list) passes its current backdrop mode as a route
  // param (`backdrop`) when opening a template, so the template opens on
  // the same background the owner just picked. Standalone there is no
  // param and the template keeps its dark default. Read once on mount
  // (lazy initialiser) so navigating inside the template never resets it.
  const params = useLocalSearchParams();
  const [backdrop, setBackdrop] = useState<BackdropMode>(() => {
    const p = params.backdrop;
    const v = Array.isArray(p) ? p[0] : p;
    return v === "dark" || v === "light" || v === "image" ? v : "dark";
  });
  const darkMode = backdrop !== 'light';
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? 'dark' : 'light');
  }, []);
  return (
    <BackdropContext.Provider value={{ backdrop, setBackdrop, darkMode, setDarkMode }}>
      {children}
    </BackdropContext.Provider>
  );
}

export function useBackdrop(): BackdropState {
  const ctx = useContext(BackdropContext);
  if (!ctx) throw new Error('useBackdrop must be used inside BackdropProvider');
  return ctx;
}
