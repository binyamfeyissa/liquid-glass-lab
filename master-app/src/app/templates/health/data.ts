/**
 * Fixtures + date helpers for Vitalis.
 *
 * Everything here is fictional sample data typed in by hand — the app reads
 * nothing from the device, its sensors, or any health service. Dates are
 * generated relative to "today" so the seed history always covers the last
 * 14 days whenever the template is opened.
 */

export type Metric = "steps" | "water" | "sleep" | "weight" | "mood";

export interface Entry {
  id: string;
  metric: Metric;
  /** steps: count · water: glasses · sleep: hours · weight: kg · mood: 1–5 */
  value: number;
  /** Local calendar day, "yyyy-mm-dd". */
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  /** How many days per week the habit is aimed at. */
  weeklyTarget: number;
}

/* ------------------------------------------------------------------ */
/*  Dates                                                              */
/* ------------------------------------------------------------------ */

export function dateKey(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(0);
}

/** "Mon 12 May" style label for a date key. */
export function dayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (key === todayKey()) return "Today";
  if (key === dateKey(1)) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Short weekday letter label ("M", "T", …) for a date key. */
export function weekdayLetter(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return "SMTWTFS"[new Date(y, m - 1, d).getDay()];
}

/* ------------------------------------------------------------------ */
/*  Seed history — 14 days of hand-entered sample data                 */
/* ------------------------------------------------------------------ */

/** Small deterministic pseudo-random so the fixtures are stable per run. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export function seedEntries(): Entry[] {
  const rand = seeded(20261122);
  const entries: Entry[] = [];
  let n = 0;
  const push = (metric: Metric, value: number, daysAgo: number) => {
    entries.push({ id: `seed-${n++}`, metric, value, date: dateKey(daysAgo) });
  };

  // Weight drifts gently down from ~70.4 kg toward the 68 kg target.
  let weight = 70.4;
  for (let ago = 13; ago >= 0; ago--) {
    push("steps", Math.round(4200 + rand() * 6800), ago);
    push("water", Math.round(4 + rand() * 5), ago);
    push("sleep", Math.round((6.4 + rand() * 2.2) * 2) / 2, ago);
    push("mood", 2 + Math.round(rand() * 3), ago);
    if (ago % 2 === 0 || ago === 13) {
      weight = Math.round((weight - rand() * 0.35) * 10) / 10;
      push("weight", weight, ago);
    }
  }
  // Today is partly logged, like a real morning: some steps, some water,
  // last night's sleep — but no mood or weight yet.
  return entries.filter(
    (e) =>
      e.date !== todayKey() ||
      e.metric === "steps" ||
      e.metric === "water" ||
      e.metric === "sleep",
  );
}

export const SEED_HABITS: Habit[] = [
  { id: "habit-meditate", name: "Meditate 10 minutes", weeklyTarget: 5 },
  { id: "habit-walk", name: "Walk after dinner", weeklyTarget: 6 },
  { id: "habit-sugar", name: "No added sugar", weeklyTarget: 5 },
  { id: "habit-read", name: "Read before bed", weeklyTarget: 4 },
];

/** Seed check history: habitId -> date keys it was checked on. */
export function seedChecks(): Record<string, string[]> {
  const rand = seeded(4242);
  const checks: Record<string, string[]> = {};
  for (const habit of SEED_HABITS) {
    const days: string[] = [];
    for (let ago = 13; ago >= 1; ago--) {
      // Most habits land most days; "No added sugar" is the patchy one.
      const chance = habit.id === "habit-sugar" ? 0.45 : 0.78;
      if (rand() < chance) days.push(dateKey(ago));
    }
    // Keep streaks believable: yesterday is checked for two of them.
    if (
      (habit.id === "habit-meditate" || habit.id === "habit-walk") &&
      !days.includes(dateKey(1))
    ) {
      days.push(dateKey(1));
    }
    checks[habit.id] = days;
  }
  return checks;
}

/* ------------------------------------------------------------------ */
/*  Display vocabulary                                                 */
/* ------------------------------------------------------------------ */

export const METRIC_META: Record<
  Metric,
  { label: string; unit: string }
> = {
  steps: { label: "Steps", unit: "steps" },
  water: { label: "Water", unit: "glasses" },
  sleep: { label: "Sleep", unit: "h" },
  weight: { label: "Weight", unit: "kg" },
  mood: { label: "Mood", unit: "" },
};

export const MOOD_LABELS = ["", "Awful", "Low", "Okay", "Good", "Great"];

export function formatValue(metric: Metric, value: number): string {
  switch (metric) {
    case "steps":
      return value.toLocaleString("en-US");
    case "water":
      return `${value}`;
    case "sleep":
      return `${value % 1 === 0 ? value : value.toFixed(1)} h`;
    case "weight":
      return `${value.toFixed(1)} kg`;
    case "mood":
      return MOOD_LABELS[value] ?? `${value}`;
  }
}
