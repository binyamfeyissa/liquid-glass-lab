import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

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
  const [backdrop, setBackdrop] = useState<BackdropMode>('dark');
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
