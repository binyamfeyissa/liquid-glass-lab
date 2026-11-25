import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ARTICLES, type Topic } from "./data";

/**
 * The Signal keeps everything in this one in-memory store: which stories
 * have been read, which are bookmarked, the topics the reader follows,
 * the body-text size, and the app's switches. There is no backend and no
 * persistence — restarting the app resets to the seed state below, which
 * is exactly what a template buyer expects from a demo build.
 */

/** The three backgrounds. Every Glacia `isDark` prop derives from it. */
export type BackdropMode = "dark" | "light" | "image";

/** Body-text size steps for the article reader and the Profile default. */
export const FONT_STEPS = [
  { value: "compact", label: "Compact", scale: 0.88 },
  { value: "standard", label: "Standard", scale: 1 },
  { value: "large", label: "Large", scale: 1.14 },
  { value: "xlarge", label: "Extra large", scale: 1.3 },
] as const;

interface SignalState {
  userName: string;

  /** Ids of stories the reader has opened. Drives dimming + stats. */
  readIds: string[];
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  articlesRead: number;
  /** Estimated reading minutes: the read-time of every opened story. */
  minutesRead: number;

  bookmarkIds: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;

  followedTopics: Topic[];
  toggleTopic: (topic: Topic) => void;

  /** Index into FONT_STEPS. */
  fontStep: number;
  setFontStep: (step: number) => void;
  fontScale: number;

  /** The three backgrounds; the switcher lives on Profile. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  breakingAlerts: boolean;
  setBreakingAlerts: (value: boolean) => void;
  briefingReminder: boolean;
  setBriefingReminder: (value: boolean) => void;
  weeklyDigest: boolean;
  setWeeklyDigest: (value: boolean) => void;
}

const SignalContext = createContext<SignalState | null>(null);

export function SignalProvider({ children }: { children: ReactNode }) {
  // Seed: two stories already read, two bookmarked, so every screen has
  // something honest to show the first time a buyer opens it.
  const [readIds, setReadIds] = useState<string[]>(["a10", "a6"]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(["a4", "a12"]);
  const [followedTopics, setFollowedTopics] = useState<Topic[]>([
    "Tech",
    "Science",
  ]);
  const [fontStep, setFontStepState] = useState(1);
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [breakingAlerts, setBreakingAlerts] = useState(true);
  const [briefingReminder, setBriefingReminder] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const isRead = useCallback((id: string) => readIds.includes(id), [readIds]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarkIds.includes(id),
    [bookmarkIds],
  );

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }, []);

  const toggleTopic = useCallback((topic: Topic) => {
    setFollowedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic],
    );
  }, []);

  const setFontStep = useCallback((step: number) => {
    setFontStepState(Math.max(0, Math.min(FONT_STEPS.length - 1, step)));
  }, []);

  const value = useMemo<SignalState>(() => {
    const minutesRead = ARTICLES.filter((a) => readIds.includes(a.id)).reduce(
      (sum, a) => sum + a.readMinutes,
      0,
    );
    return {
      userName: "Alex Rivera",
      readIds,
      isRead,
      markRead,
      articlesRead: readIds.length,
      minutesRead,
      bookmarkIds,
      isBookmarked,
      toggleBookmark,
      followedTopics,
      toggleTopic,
      fontStep,
      setFontStep,
      fontScale: FONT_STEPS[fontStep].scale,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      breakingAlerts,
      setBreakingAlerts,
      briefingReminder,
      setBriefingReminder,
      weeklyDigest,
      setWeeklyDigest,
    };
  }, [
    readIds,
    isRead,
    markRead,
    bookmarkIds,
    isBookmarked,
    toggleBookmark,
    followedTopics,
    toggleTopic,
    fontStep,
    setFontStep,
    backdrop,
    darkMode,
    breakingAlerts,
    briefingReminder,
    weeklyDigest,
  ]);

  return (
    <SignalContext.Provider value={value}>{children}</SignalContext.Provider>
  );
}

export function useSignal(): SignalState {
  const ctx = useContext(SignalContext);
  if (!ctx) throw new Error("useSignal must be used inside SignalProvider");
  return ctx;
}
