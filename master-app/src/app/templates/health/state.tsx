import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";

import {
  dateKey,
  seedChecks,
  seedEntries,
  todayKey,
  SEED_HABITS,
  type Entry,
  type Habit,
  type Metric,
} from "./data";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend, no persistence and no sensor access: every number in Vitalis
 * is sample data typed in by hand on the Log screen. Logging on one screen
 * immediately updates Today, Trends and History; restarting the app resets
 * the fixtures.
 */

export interface Goals {
  steps: number;
  water: number;
  sleep: number;
  /** Target weight in kg. */
  weight: number;
}

export interface Reminders {
  morning: boolean;
  evening: boolean;
  weekly: boolean;
}

/** The three backgrounds. Every Glacia `isDark` prop derives from it. */
export type BackdropMode = "dark" | "light" | "image";

interface HealthState {
  entries: Entry[];
  habits: Habit[];
  /** habitId -> date keys the habit was checked on. */
  checks: Record<string, string[]>;
  goals: Goals;
  userName: string;
  heightCm: number;
  /** The three backgrounds. Every Glacia `isDark` prop derives from it. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  reminders: Reminders;

  /* Derived readers */
  /** Sum of a metric's entries on one day (steps/water are cumulative). */
  dayTotal: (metric: Metric, key: string) => number;
  /** Latest entry value for a metric on one day, if any. */
  dayLatest: (metric: Metric, key: string) => number | undefined;
  /** Latest weight reading on or before today. */
  latestWeight: () => number | undefined;
  /** Consecutive checked days ending today (or yesterday if not yet done). */
  streakOf: (habitId: string) => number;
  checkedOn: (habitId: string, key: string) => boolean;

  /* Actions */
  addEntry: (metric: Metric, value: number, key?: string) => void;
  /** Set a cumulative metric's total for a day via a compensating entry. */
  setDayTotal: (metric: Metric, key: string, total: number) => void;
  deleteEntry: (id: string) => void;
  toggleCheck: (habitId: string, key: string) => void;
  addHabit: (name: string, weeklyTarget: number) => void;
  setGoals: (goals: Goals) => void;
  setUserName: (name: string) => void;
  setHeightCm: (cm: number) => void;
  setDarkMode: (dark: boolean) => void;
  setReminders: (r: Reminders) => void;
}

const HealthContext = createContext<HealthState | null>(null);

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `entry-${Date.now()}-${idCounter}`;
}

export function HealthProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(() => seedEntries());
  const [habits, setHabits] = useState<Habit[]>(SEED_HABITS);
  const [checks, setChecks] = useState<Record<string, string[]>>(() =>
    seedChecks(),
  );
  const [goals, setGoals] = useState<Goals>({
    steps: 8000,
    water: 8,
    sleep: 8,
    weight: 68,
  });
  const [userName, setUserName] = useState("Alex Morgan");
  const [heightCm, setHeightCm] = useState(172);
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
  const [reminders, setReminders] = useState<Reminders>({
    morning: true,
    evening: false,
    weekly: true,
  });

  const dayTotal = useCallback(
    (metric: Metric, key: string) =>
      entries
        .filter((e) => e.metric === metric && e.date === key)
        .reduce((sum, e) => sum + e.value, 0),
    [entries],
  );

  const dayLatest = useCallback(
    (metric: Metric, key: string) => {
      const day = entries.filter((e) => e.metric === metric && e.date === key);
      return day.length ? day[day.length - 1].value : undefined;
    },
    [entries],
  );

  const latestWeight = useCallback(() => {
    const weights = entries.filter((e) => e.metric === "weight");
    return weights.length ? weights[weights.length - 1].value : undefined;
  }, [entries]);

  const checkedOn = useCallback(
    (habitId: string, key: string) => (checks[habitId] ?? []).includes(key),
    [checks],
  );

  const streakOf = useCallback(
    (habitId: string) => {
      const days = new Set(checks[habitId] ?? []);
      // A streak is still alive if today isn't checked yet but yesterday is.
      let ago = days.has(todayKey()) ? 0 : 1;
      let streak = 0;
      while (days.has(dateKey(ago))) {
        streak += 1;
        ago += 1;
      }
      return streak;
    },
    [checks],
  );

  const addEntry = useCallback(
    (metric: Metric, value: number, key: string = todayKey()) => {
      setEntries((prev) => [...prev, { id: nextId(), metric, value, date: key }]);
    },
    [],
  );

  const setDayTotal = useCallback(
    (metric: Metric, key: string, total: number) => {
      const current = entries
        .filter((e) => e.metric === metric && e.date === key)
        .reduce((sum, e) => sum + e.value, 0);
      const delta = total - current;
      if (delta !== 0) {
        setEntries((prev) => [
          ...prev,
          { id: nextId(), metric, value: delta, date: key },
        ]);
      }
    },
    [entries],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleCheck = useCallback((habitId: string, key: string) => {
    setChecks((prev) => {
      const days = prev[habitId] ?? [];
      return {
        ...prev,
        [habitId]: days.includes(key)
          ? days.filter((d) => d !== key)
          : [...days, key],
      };
    });
  }, []);

  const addHabit = useCallback((name: string, weeklyTarget: number) => {
    const id = `habit-${Date.now()}`;
    setHabits((prev) => [...prev, { id, name, weeklyTarget }]);
    setChecks((prev) => ({ ...prev, [id]: [] }));
  }, []);

  const value = useMemo<HealthState>(
    () => ({
      entries,
      habits,
      checks,
      goals,
      userName,
      heightCm,
      backdrop,
      setBackdrop,
      darkMode,
      reminders,
      dayTotal,
      dayLatest,
      latestWeight,
      streakOf,
      checkedOn,
      addEntry,
      setDayTotal,
      deleteEntry,
      toggleCheck,
      addHabit,
      setGoals,
      setUserName,
      setHeightCm,
      setDarkMode,
      setReminders,
    }),
    [
      entries,
      habits,
      checks,
      goals,
      userName,
      heightCm,
      backdrop,
      darkMode,
      reminders,
      dayTotal,
      dayLatest,
      latestWeight,
      streakOf,
      checkedOn,
      addEntry,
      setDayTotal,
      deleteEntry,
      toggleCheck,
      addHabit,
    ],
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth(): HealthState {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used inside <HealthProvider>");
  return ctx;
}
