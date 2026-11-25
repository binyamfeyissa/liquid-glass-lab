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
 * - "light" — pale gradient blobs (Bank's light backdrop)
 * - "dark"  — deep gradient blobs (Bank's dark backdrop)
 * - "image" — a full-screen photo, so the glass refraction over a busy
 *             picture is visible
 */
export type BackdropMode = "light" | "dark" | "image";

const ORDER: BackdropMode[] = ["light", "dark", "image"];

interface BackdropModeValue {
  mode: BackdropMode;
  /** Light → Dark → Image → Light. */
  cycleMode: () => void;
  /** What GlassProvider and the components should be told. The photo is
   *  bright, so Image mode renders the light theme over it. */
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
    () => ({ mode, cycleMode, isDark: mode === "dark" }),
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
