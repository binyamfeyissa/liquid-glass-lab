import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";

import { WEEK_MINUTES_SEED } from "./data";

export type BackdropMode = "dark" | "light" | "image";

/**
 * The whole template keeps its data in this one client-side store. There
 * is no backend and no persistence: state lives in memory for the
 * session, so finishing a session in the Player immediately updates the
 * minutes on Home and the bars and history on Progress. Restarting the
 * app resets the fixtures.
 */

export interface HistoryEntry {
  id: string;
  kind: "session" | "breathing";
  title: string;
  minutes: number;
  whenLabel: string;
}

export interface MixerState {
  /** Sound id -> volume 0..100. A sound at 0 is out of the mix. */
  volumes: Record<string, number>;
  timerMinutes: number;
}

interface StillwaterState {
  userName: string;
  /** Bundled portrait of the signed-in user. */
  userImage: number;
  setUserName: (name: string) => void;

  /** Minutes practised today: the seed plus this session's completions. */
  todayMinutes: number;
  /** Daily goal in minutes, from the Profile tab. */
  goalMinutes: number;
  setGoalMinutes: (minutes: number) => void;
  /** Consecutive days practised, including today once you practise. */
  streakDays: number;
  /** Mon..Sun minutes; the last entry moves with today's completions. */
  weekMinutes: number[];

  history: HistoryEntry[];
  /** Adds minutes to today + the week bar and appends a history entry. */
  completePractice: (entry: Omit<HistoryEntry, "id" | "whenLabel">) => void;

  /** Last session opened in the player, for Continue listening. */
  lastSessionId: string;
  lastSessionElapsed: number;
  setLastSession: (sessionId: string, elapsedSec: number) => void;

  mixer: MixerState;
  setSoundVolume: (soundId: string, volume: number) => void;
  setMixerTimer: (minutes: number) => void;

  bedtime: string;
  setBedtime: (time: string) => void;
  bedtimeReminder: boolean;
  setBedtimeReminder: (value: boolean) => void;

  /** The three backgrounds. Everything else derives from this. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  dailyReminder: boolean;
  setDailyReminder: (value: boolean) => void;
  weeklyReport: boolean;
  setWeeklyReport: (value: boolean) => void;
}

const StillwaterContext = createContext<StillwaterState | null>(null);

const SEED_HISTORY: HistoryEntry[] = [
  { id: "h1", kind: "session", title: "First Light", minutes: 7, whenLabel: "Today · 7:05 AM" },
  { id: "h2", kind: "breathing", title: "Breathing · Box 4 · 4 · 4 · 4", minutes: 2, whenLabel: "Yesterday · 9:41 PM" },
  { id: "h3", kind: "session", title: "Let the Day Go", minutes: 14, whenLabel: "Yesterday · 9:12 PM" },
  { id: "h4", kind: "session", title: "Drift Into Sleep", minutes: 20, whenLabel: "Fri · 10:48 PM" },
];

const SEED_TODAY_MINUTES = 7; // the First Light entry above
const SEED_STREAK = 5;

let counter = 100;
const nextId = () => `p${++counter}`;

export function StillwaterProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Alex Rivera");
  const [goalMinutes, setGoalMinutes] = useState(15);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [lastSessionId, setLastSessionId] = useState("calm-the-spiral");
  const [lastSessionElapsed, setLastSessionElapsed] = useState(190);
  const [mixer, setMixer] = useState<MixerState>({
    volumes: { rain: 60, ocean: 0, forest: 35, noise: 0 },
    timerMinutes: 30,
  });
  const [bedtime, setBedtime] = useState("22:30");
  const [bedtimeReminder, setBedtimeReminder] = useState(true);
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
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const todayMinutes = SEED_TODAY_MINUTES + sessionMinutes;

  const weekMinutes = useMemo(() => {
    const week = [...WEEK_MINUTES_SEED];
    week[week.length - 1] = todayMinutes;
    return week;
  }, [todayMinutes]);

  const completePractice = useCallback(
    (entry: Omit<HistoryEntry, "id" | "whenLabel">) => {
      setSessionMinutes((m) => m + entry.minutes);
      setHistory((prev) => [
        { ...entry, id: nextId(), whenLabel: "Just now" },
        ...prev,
      ]);
    },
    [],
  );

  const setLastSession = useCallback((sessionId: string, elapsedSec: number) => {
    setLastSessionId(sessionId);
    setLastSessionElapsed(elapsedSec);
  }, []);

  const setSoundVolume = useCallback((soundId: string, volume: number) => {
    setMixer((prev) => ({
      ...prev,
      volumes: { ...prev.volumes, [soundId]: volume },
    }));
  }, []);

  const setMixerTimer = useCallback((minutes: number) => {
    setMixer((prev) => ({ ...prev, timerMinutes: minutes }));
  }, []);

  const value = useMemo<StillwaterState>(
    () => ({
      userName,
      userImage: require("./assets/img/alex-rivera.jpg"),
      setUserName,
      todayMinutes,
      goalMinutes,
      setGoalMinutes,
      streakDays: SEED_STREAK,
      weekMinutes,
      history,
      completePractice,
      lastSessionId,
      lastSessionElapsed,
      setLastSession,
      mixer,
      setSoundVolume,
      setMixerTimer,
      bedtime,
      setBedtime,
      bedtimeReminder,
      setBedtimeReminder,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      dailyReminder,
      setDailyReminder,
      weeklyReport,
      setWeeklyReport,
    }),
    [
      userName,
      todayMinutes,
      goalMinutes,
      weekMinutes,
      history,
      completePractice,
      lastSessionId,
      lastSessionElapsed,
      setLastSession,
      mixer,
      setSoundVolume,
      setMixerTimer,
      bedtime,
      bedtimeReminder,
      backdrop,
      darkMode,
      setDarkMode,
      dailyReminder,
      weeklyReport,
    ],
  );

  return (
    <StillwaterContext.Provider value={value}>{children}</StillwaterContext.Provider>
  );
}

export function useStillwater(): StillwaterState {
  const ctx = useContext(StillwaterContext);
  if (!ctx) throw new Error("useStillwater must be used inside StillwaterProvider");
  return ctx;
}
