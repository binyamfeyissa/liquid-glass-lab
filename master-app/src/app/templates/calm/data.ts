/**
 * Fixtures for Stillwater: the session catalogue, the sleep-sound mixer
 * catalogue, breathing patterns and the week's practice minutes. All
 * content is invented for the template; playback is simulated with
 * timers — there is no audio anywhere in this app.
 */

export type Category = "Sleep" | "Focus" | "Anxiety" | "Morning";

export const CATEGORIES: Category[] = ["Sleep", "Focus", "Anxiety", "Morning"];

export interface Session {
  id: string;
  title: string;
  category: Category;
  /** Length in seconds (the player ticks in real seconds). */
  durationSec: number;
  narrator: string;
  plays: string;
  blurb: string;
  /** Two-stop artwork gradient for the composed cover panel. */
  art: [string, string];
  /** Bundled cover photo, shown in place of the flat plate. */
  image: number;
  featured?: boolean;
}

export const SESSIONS: Session[] = [
  {
    id: "drift-into-sleep",
    title: "Drift Into Sleep",
    category: "Sleep",
    durationSec: 20 * 60,
    narrator: "Elena Marsh",
    plays: "1.2M",
    blurb: "A slow body scan that loosens the day, breath by breath, until sleep takes over.",
    art: ["#1e3a8a", "#7c3aed"],
    image: require("./assets/img/drift-into-sleep.jpg"),
    featured: true,
  },
  {
    id: "deep-rest",
    title: "Deep Rest, No Dreams",
    category: "Sleep",
    durationSec: 45 * 60,
    narrator: "Tom Okafor",
    plays: "864K",
    blurb: "Yoga-nidra style guided rest for nights when the mind won't switch off.",
    art: ["#0f172a", "#155e75"],
    image: require("./assets/img/deep-rest.jpg"),
  },
  {
    id: "rainy-cabin",
    title: "Rainy Cabin Wind-Down",
    category: "Sleep",
    durationSec: 15 * 60,
    narrator: "Elena Marsh",
    plays: "642K",
    blurb: "A short story and soft pacing designed to pair with the rain mixer.",
    art: ["#164e63", "#3b0764"],
    image: require("./assets/img/rainy-cabin.jpg"),
  },
  {
    id: "focus-flow",
    title: "Focus Flow",
    category: "Focus",
    durationSec: 10 * 60,
    narrator: "Priya Nair",
    plays: "918K",
    blurb: "Ten minutes to clear the desk in your head before deep work.",
    art: ["#065f46", "#0ea5e9"],
    image: require("./assets/img/focus-flow.jpg"),
    featured: true,
  },
  {
    id: "single-task-mind",
    title: "The Single-Task Mind",
    category: "Focus",
    durationSec: 12 * 60,
    narrator: "Marcus Hale",
    plays: "377K",
    blurb: "Attention training: one object, gently returned to, again and again.",
    art: ["#134e4a", "#65a30d"],
    image: require("./assets/img/single-task-mind.jpg"),
  },
  {
    id: "reset-between-meetings",
    title: "Reset Between Meetings",
    category: "Focus",
    durationSec: 5 * 60,
    narrator: "Priya Nair",
    plays: "529K",
    blurb: "A five-minute palate cleanser so the last call doesn't leak into the next.",
    art: ["#0e7490", "#2563eb"],
    image: require("./assets/img/reset-between-meetings.jpg"),
  },
  {
    id: "calm-the-spiral",
    title: "Calm the Spiral",
    category: "Anxiety",
    durationSec: 8 * 60,
    narrator: "Sofia Lindqvist",
    plays: "1.5M",
    blurb: "Grounding for racing thoughts: name it, breathe it down, let it pass.",
    art: ["#7c2d12", "#db2777"],
    image: require("./assets/img/calm-the-spiral.jpg"),
    featured: true,
  },
  {
    id: "steady-before-speaking",
    title: "Steady Before Speaking",
    category: "Anxiety",
    durationSec: 6 * 60,
    narrator: "Marcus Hale",
    plays: "288K",
    blurb: "For presentations, interviews and hard conversations: arrive settled.",
    art: ["#9a3412", "#b45309"],
    image: require("./assets/img/steady-before-speaking.jpg"),
  },
  {
    id: "let-the-day-go",
    title: "Let the Day Go",
    category: "Anxiety",
    durationSec: 14 * 60,
    narrator: "Sofia Lindqvist",
    plays: "703K",
    blurb: "An evening release practice for replaying-the-day minds.",
    art: ["#831843", "#6d28d9"],
    image: require("./assets/img/let-the-day-go.jpg"),
  },
  {
    id: "first-light",
    title: "First Light",
    category: "Morning",
    durationSec: 7 * 60,
    narrator: "Tom Okafor",
    plays: "811K",
    blurb: "Wake the body before the phone: breath, light and one clear intention.",
    art: ["#b45309", "#f59e0b"],
    image: require("./assets/img/first-light.jpg"),
    featured: true,
  },
  {
    id: "morning-pages-mind",
    title: "Morning Pages Mind",
    category: "Morning",
    durationSec: 11 * 60,
    narrator: "Elena Marsh",
    plays: "196K",
    blurb: "A journaling companion — prompts spaced with silence to write into.",
    art: ["#a16207", "#059669"],
    image: require("./assets/img/morning-pages-mind.jpg"),
  },
  {
    id: "commute-calm",
    title: "Commute Calm",
    category: "Morning",
    durationSec: 9 * 60,
    narrator: "Priya Nair",
    plays: "445K",
    blurb: "Eyes-open practice for trains and traffic. Arrive as yourself.",
    art: ["#0369a1", "#a16207"],
    image: require("./assets/img/commute-calm.jpg"),
  },
];

/* ------------------------------------------------------------------ */
/*  Sleep sounds                                                       */
/* ------------------------------------------------------------------ */

export interface SoundDef {
  id: string;
  name: string;
  detail: string;
  /** Bundled photo for the sound's avatar, if it has a clear subject. */
  image?: number;
}

export const SOUNDS: SoundDef[] = [
  { id: "rain", name: "Rain", detail: "Steady rainfall on a cabin roof", image: require("./assets/img/rainy-cabin.jpg") },
  { id: "ocean", name: "Ocean", detail: "Slow waves, long shore", image: require("./assets/img/ocean-sound.jpg") },
  { id: "forest", name: "Forest", detail: "Night pines and distant owls", image: require("./assets/img/forest-sound.jpg") },
  { id: "noise", name: "White noise", detail: "Even static that masks the street" },
];

export const MIXER_TIMER_OPTIONS = [
  { value: "0", label: "No timer" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

export const BEDTIME_OPTIONS = [
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
  { value: "23:30", label: "11:30 PM" },
];

/* ------------------------------------------------------------------ */
/*  Breathing patterns                                                 */
/* ------------------------------------------------------------------ */

export interface BreathPhase {
  label: string;
  seconds: number;
  /** Circle scale target for this phase (1 = resting size). */
  scale: number;
}

export interface BreathPattern {
  id: string;
  name: string;
  detail: string;
  phases: BreathPhase[];
}

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: "446",
    name: "4 · 4 · 6",
    detail: "In 4 · Hold 4 · Out 6 — the evening default",
    phases: [
      { label: "Breathe in", seconds: 4, scale: 1.45 },
      { label: "Hold", seconds: 4, scale: 1.45 },
      { label: "Breathe out", seconds: 6, scale: 1 },
    ],
  },
  {
    id: "box",
    name: "Box 4 · 4 · 4 · 4",
    detail: "In · Hold · Out · Hold — steady under pressure",
    phases: [
      { label: "Breathe in", seconds: 4, scale: 1.45 },
      { label: "Hold", seconds: 4, scale: 1.45 },
      { label: "Breathe out", seconds: 4, scale: 1 },
      { label: "Hold", seconds: 4, scale: 1 },
    ],
  },
  {
    id: "478",
    name: "4 · 7 · 8",
    detail: "In 4 · Hold 7 · Out 8 — the sleep classic",
    phases: [
      { label: "Breathe in", seconds: 4, scale: 1.45 },
      { label: "Hold", seconds: 7, scale: 1.45 },
      { label: "Breathe out", seconds: 8, scale: 1 },
    ],
  },
];

export const CYCLE_OPTIONS = [
  { value: "4", label: "4 cycles" },
  { value: "6", label: "6 cycles" },
  { value: "8", label: "8 cycles" },
  { value: "10", label: "10 cycles" },
];

/* ------------------------------------------------------------------ */
/*  Player options                                                     */
/* ------------------------------------------------------------------ */

export const SLEEP_TIMER_OPTIONS = [
  { value: "0", label: "Off" },
  { value: "10", label: "10 minutes" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" },
];

export const SPEED_SEGMENTS = ["0.75×", "1×", "1.25×", "1.5×"];
export const SPEED_VALUES = [0.75, 1, 1.25, 1.5];

export const GOAL_OPTIONS = [
  { value: "10", label: "10 minutes a day" },
  { value: "15", label: "15 minutes a day" },
  { value: "20", label: "20 minutes a day" },
  { value: "30", label: "30 minutes a day" },
];

/* ------------------------------------------------------------------ */
/*  Practice week fixture (Mon..Sun; today is the last entry and is    */
/*  topped up live by completions during the session).                 */
/* ------------------------------------------------------------------ */

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WEEK_MINUTES_SEED = [12, 18, 0, 22, 15, 26, 0];

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${rest.toString().padStart(2, "0")}`;
}

export function formatDuration(durationSec: number): string {
  const m = Math.round(durationSec / 60);
  return `${m} min`;
}
