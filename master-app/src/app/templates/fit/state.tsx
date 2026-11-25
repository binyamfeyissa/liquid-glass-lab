import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  LIFETIME_BASE,
  SEED_HISTORY,
  STREAK_DAYS,
  TODAY_BASE,
  WEEK_MINUTES_BASE,
  WORKOUTS,
  totalSets,
  type HistoryEntry,
  type Workout,
} from "./data";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend and no persistence: state lives in memory for the session, so
 * finishing a workout in the player immediately updates Today, Activity and
 * Goals. Restarting the app resets the fixtures.
 */

export interface LogResult {
  durationMin: number;
  calories: number;
  exercisesDone: number;
  setsDone: number;
}

export type BackdropMode = "dark" | "light" | "image";

interface FitState {
  userName: string;

  workouts: Workout[];
  history: HistoryEntry[];
  /** Prepend a finished (or partially finished) session to the history. */
  logWorkout: (workout: Workout, result: LogResult) => HistoryEntry;

  /** Sessions completed in the last seven days, including today's. */
  weekWorkouts: HistoryEntry[];
  weekMinutes: number;
  weekCalories: number;

  /** Active minutes for the last 7 days (oldest → today), live. */
  weekBars: { label: string; minutes: number; isToday: boolean }[];

  /** Today's totals: fixture baseline + anything logged in the player. */
  todaySteps: number;
  stepGoal: number;
  todayCalories: number;
  todayActiveMin: number;
  todaysSessions: HistoryEntry[];

  weeklyGoal: number;
  setWeeklyGoal: (value: number) => void;
  streakDays: number;

  lifetimeWorkouts: number;
  lifetimeHours: number;
  lifetimeCalories: number;

  /** The three backgrounds: dark gray, broken white, or the Tahoe photo. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  weeklyReport: boolean;
  setWeeklyReport: (value: boolean) => void;
}

const FitContext = createContext<FitState | null>(null);

let counter = 100;
const nextId = () => `s${++counter}`;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function FitProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [weeklyGoal, setWeeklyGoal] = useState(4);
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [notifications, setNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const logWorkout = useCallback((workout: Workout, result: LogResult) => {
    const entry: HistoryEntry = {
      id: nextId(),
      workoutId: workout.id,
      workoutName: workout.name,
      category: workout.category,
      dayOffset: 0,
      dateLabel: "Today",
      durationMin: result.durationMin,
      calories: result.calories,
      exercisesDone: result.exercisesDone,
      setsDone: result.setsDone,
    };
    setHistory((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const value = useMemo<FitState>(() => {
    const todaysSessions = history.filter((h) => h.dayOffset === 0);
    const weekWorkouts = history.filter((h) => h.dayOffset < 7);
    const weekMinutes = weekWorkouts.reduce((s, h) => s + h.durationMin, 0);
    const weekCalories = weekWorkouts.reduce((s, h) => s + h.calories, 0);

    const todayLoggedMin = todaysSessions.reduce((s, h) => s + h.durationMin, 0);
    const todayLoggedCal = todaysSessions.reduce((s, h) => s + h.calories, 0);
    // A finished session also moves the step counter a little — roughly
    // 90 steps per active minute is a fair walking-pace estimate.
    const todaySteps = TODAY_BASE.steps + todayLoggedMin * 90;

    const today = new Date();
    const weekBars = WEEK_MINUTES_BASE.map((base, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const isToday = i === 6;
      return {
        label: DAY_LABELS[date.getDay()],
        minutes: isToday ? TODAY_BASE.activeMin + todayLoggedMin : base,
        isToday,
      };
    });

    const loggedCount = history.length - SEED_HISTORY.length;
    const loggedMinutes = history
      .filter((h) => h.id.startsWith("s"))
      .reduce((s, h) => s + h.durationMin, 0);
    const loggedCalories = history
      .filter((h) => h.id.startsWith("s"))
      .reduce((s, h) => s + h.calories, 0);

    return {
      userName: "Jordan Ellis",
      workouts: WORKOUTS,
      history,
      logWorkout,
      weekWorkouts,
      weekMinutes,
      weekCalories,
      weekBars,
      todaySteps,
      stepGoal: TODAY_BASE.stepGoal,
      todayCalories: TODAY_BASE.calories + todayLoggedCal,
      todayActiveMin: TODAY_BASE.activeMin + todayLoggedMin,
      todaysSessions,
      weeklyGoal,
      setWeeklyGoal,
      streakDays: STREAK_DAYS,
      lifetimeWorkouts: LIFETIME_BASE.workouts + loggedCount,
      lifetimeHours: LIFETIME_BASE.hours + loggedMinutes / 60,
      lifetimeCalories: LIFETIME_BASE.calories + loggedCalories,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
      weeklyReport,
      setWeeklyReport,
    };
  }, [history, logWorkout, weeklyGoal, backdrop, notifications, weeklyReport]);

  return <FitContext.Provider value={value}>{children}</FitContext.Provider>;
}

export function useFit(): FitState {
  const ctx = useContext(FitContext);
  if (!ctx) throw new Error("useFit must be used inside FitProvider");
  return ctx;
}

/** Share of a workout completed, for proportional duration/calorie credit. */
export function completionShare(workout: Workout, setsDone: number): number {
  const total = totalSets(workout);
  if (total === 0) return 0;
  return Math.min(1, setsDone / total);
}
