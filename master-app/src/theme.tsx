import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The three showcase backdrops. The mode lives in context so it survives
 * navigation between the home list and every component screen.
 *
 * - "light" — broken white #f7f4ee
 * - "dark"  — dark graphite #141415
 * - "image" — the palm-leaves photo, full-screen under a 38% scrim
 */
export type BackdropMode = "light" | "dark" | "image";

const ORDER: BackdropMode[] = ["light", "dark", "image"];

interface BackdropModeValue {
  mode: BackdropMode;
  /** Light → Dark → Image → Light. */
  cycleMode: () => void;
  /** What GlassProvider and the components should be told. The palm
   *  photo is dark, so Image mode renders the dark theme over it —
   *  same as the templates (`darkMode = backdrop !== "light"`). */
  isDark: boolean;
}

const BackdropModeContext = createContext<BackdropModeValue>({
  mode: "light",
  cycleMode: () => {},
  isDark: false,
});

export function BackdropModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<BackdropMode>("light");
  const cycleMode = useCallback(() => {
    setMode((m) => ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]);
  }, []);
  const value = useMemo<BackdropModeValue>(
    () => ({ mode, cycleMode, isDark: mode !== "light" }),
    [mode, cycleMode],
  );
  return (
    <BackdropModeContext.Provider value={value}>
      {children}
    </BackdropModeContext.Provider>
  );
}

export function useBackdropMode(): BackdropModeValue {
  return useContext(BackdropModeContext);
}
