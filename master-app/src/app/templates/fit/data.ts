/**
 * Pulse's catalogue and seed history. Everything here is fixture data —
 * realistic, self-consistent sample content a buyer can replace with a
 * real API. There is no backend anywhere in this template.
 */

export type Category = "Strength" | "Cardio" | "Mobility" | "HIIT";

export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Strength",
  "Cardio",
  "HIIT",
  "Mobility",
];

export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface Exercise {
  name: string;
  sets: number;
  /** Human prescription, e.g. "10 reps", "40 sec", "400 m". */
  reps: string;
  /** Rest after each set, in seconds. */
  restSec: number;
  /** Two-letter monogram for the composed tile — no image assets. */
  monogram: string;
}

export interface Workout {
  id: string;
  name: string;
  category: Category;
  level: Level;
  durationMin: number;
  calories: number;
  /** One flat, toned colour field for the composed cover tile. */
  tone: string;
  blurb: string;
  exercises: Exercise[];
}

export const WORKOUTS: Workout[] = [
  {
    id: "full-body-strength",
    name: "Full-Body Strength",
    category: "Strength",
    level: "Intermediate",
    durationMin: 38,
    calories: 310,
    tone: "#8c4a2f",
    blurb: "Squat, push, pull and hinge — the whole body in one session",
    exercises: [
      { name: "Goblet Squats", sets: 4, reps: "10 reps", restSec: 45, monogram: "GS" },
      { name: "Push-Ups", sets: 4, reps: "12 reps", restSec: 40, monogram: "PU" },
      { name: "Bent-Over Rows", sets: 4, reps: "10 reps", restSec: 45, monogram: "BR" },
      { name: "Romanian Deadlifts", sets: 3, reps: "12 reps", restSec: 50, monogram: "RD" },
      { name: "Plank Hold", sets: 3, reps: "40 sec", restSec: 30, monogram: "PH" },
      { name: "Walking Lunges", sets: 3, reps: "16 reps", restSec: 40, monogram: "WL" },
    ],
  },
  {
    id: "upper-body-power",
    name: "Upper Body Power",
    category: "Strength",
    level: "Advanced",
    durationMin: 32,
    calories: 285,
    tone: "#4a5a6a",
    blurb: "Heavy pressing and pulling for chest, back and arms",
    exercises: [
      { name: "Dumbbell Bench Press", sets: 4, reps: "8 reps", restSec: 60, monogram: "BP" },
      { name: "Pull-Ups", sets: 4, reps: "6 reps", restSec: 60, monogram: "PL" },
      { name: "Overhead Press", sets: 3, reps: "10 reps", restSec: 45, monogram: "OP" },
      { name: "Incline Flyes", sets: 3, reps: "12 reps", restSec: 40, monogram: "IF" },
      { name: "Hammer Curls", sets: 3, reps: "12 reps", restSec: 35, monogram: "HC" },
    ],
  },
  {
    id: "leg-day-foundation",
    name: "Leg Day Foundation",
    category: "Strength",
    level: "Intermediate",
    durationMin: 40,
    calories: 340,
    tone: "#5f6b3a",
    blurb: "Quads, glutes and calves with joint-friendly progressions",
    exercises: [
      { name: "Back Squats", sets: 4, reps: "8 reps", restSec: 60, monogram: "BS" },
      { name: "Hip Thrusts", sets: 4, reps: "12 reps", restSec: 45, monogram: "HT" },
      { name: "Bulgarian Split Squats", sets: 3, reps: "10 / leg", restSec: 45, monogram: "SS" },
      { name: "Leg Curls", sets: 3, reps: "12 reps", restSec: 40, monogram: "LC" },
      { name: "Standing Calf Raises", sets: 4, reps: "15 reps", restSec: 30, monogram: "CR" },
      { name: "Wall Sit", sets: 3, reps: "45 sec", restSec: 30, monogram: "WS" },
    ],
  },
  {
    id: "endurance-intervals",
    name: "Endurance Run Intervals",
    category: "Cardio",
    level: "Intermediate",
    durationMin: 30,
    calories: 360,
    tone: "#a34d28",
    blurb: "Alternating fast and easy efforts to build your engine",
    exercises: [
      { name: "Easy Warm-Up Jog", sets: 1, reps: "5 min", restSec: 30, monogram: "WJ" },
      { name: "Fast Interval", sets: 6, reps: "400 m", restSec: 60, monogram: "FI" },
      { name: "Recovery Jog", sets: 5, reps: "200 m", restSec: 20, monogram: "RJ" },
      { name: "Tempo Run", sets: 1, reps: "8 min", restSec: 30, monogram: "TR" },
      { name: "Cool-Down Walk", sets: 1, reps: "4 min", restSec: 0, monogram: "CW" },
    ],
  },
  {
    id: "low-impact-cardio",
    name: "Low-Impact Cardio Flow",
    category: "Cardio",
    level: "Beginner",
    durationMin: 25,
    calories: 190,
    tone: "#2f5f5a",
    blurb: "Steady, joint-friendly movement that still gets the heart up",
    exercises: [
      { name: "March in Place", sets: 3, reps: "60 sec", restSec: 20, monogram: "MP" },
      { name: "Step Touches", sets: 3, reps: "45 sec", restSec: 20, monogram: "ST" },
      { name: "Shadow Boxing", sets: 4, reps: "40 sec", restSec: 30, monogram: "SB" },
      { name: "Standing Knee Raises", sets: 3, reps: "20 reps", restSec: 20, monogram: "KR" },
      { name: "Gentle Cool-Down", sets: 1, reps: "3 min", restSec: 0, monogram: "CD" },
    ],
  },
  {
    id: "hiit-ignite",
    name: "HIIT Ignite",
    category: "HIIT",
    level: "Advanced",
    durationMin: 20,
    calories: 265,
    tone: "#8c3b2e",
    blurb: "Short, sharp intervals. Twenty minutes, nowhere to hide",
    exercises: [
      { name: "Burpees", sets: 4, reps: "30 sec", restSec: 30, monogram: "BU" },
      { name: "Mountain Climbers", sets: 4, reps: "40 sec", restSec: 25, monogram: "MC" },
      { name: "Kettlebell Swings", sets: 4, reps: "15 reps", restSec: 35, monogram: "KS" },
      { name: "Jump Squats", sets: 3, reps: "12 reps", restSec: 30, monogram: "JS" },
      { name: "High Knees", sets: 3, reps: "30 sec", restSec: 25, monogram: "HK" },
      { name: "Plank Shoulder Taps", sets: 3, reps: "20 reps", restSec: 20, monogram: "PT" },
    ],
  },
  {
    id: "core-crusher",
    name: "Core Crusher Express",
    category: "HIIT",
    level: "Beginner",
    durationMin: 15,
    calories: 120,
    tone: "#8a6414",
    blurb: "A quick core burner that fits anywhere in your day",
    exercises: [
      { name: "Dead Bugs", sets: 3, reps: "12 reps", restSec: 25, monogram: "DB" },
      { name: "Russian Twists", sets: 3, reps: "20 reps", restSec: 25, monogram: "RT" },
      { name: "Bicycle Crunches", sets: 3, reps: "16 reps", restSec: 25, monogram: "BC" },
      { name: "Forearm Plank", sets: 3, reps: "35 sec", restSec: 30, monogram: "FP" },
      { name: "Leg Raises", sets: 3, reps: "10 reps", restSec: 25, monogram: "LR" },
    ],
  },
  {
    id: "morning-mobility",
    name: "Morning Mobility",
    category: "Mobility",
    level: "Beginner",
    durationMin: 18,
    calories: 75,
    tone: "#4f6248",
    blurb: "Wake up hips, spine and shoulders before the day starts",
    exercises: [
      { name: "Cat-Cow Flow", sets: 2, reps: "8 reps", restSec: 15, monogram: "CC" },
      { name: "World's Greatest Stretch", sets: 2, reps: "5 / side", restSec: 15, monogram: "WG" },
      { name: "Hip Circles", sets: 2, reps: "10 / side", restSec: 15, monogram: "HC" },
      { name: "Thoracic Openers", sets: 2, reps: "8 / side", restSec: 15, monogram: "TO" },
      { name: "Deep Squat Hold", sets: 3, reps: "30 sec", restSec: 20, monogram: "DS" },
      { name: "Standing Forward Fold", sets: 2, reps: "45 sec", restSec: 10, monogram: "FF" },
    ],
  },
  {
    id: "deep-stretch",
    name: "Deep Stretch & Recovery",
    category: "Mobility",
    level: "Beginner",
    durationMin: 22,
    calories: 85,
    tone: "#6b4a5e",
    blurb: "Slow holds to undo a hard week of training (or sitting)",
    exercises: [
      { name: "Pigeon Pose", sets: 2, reps: "60 sec / side", restSec: 15, monogram: "PP" },
      { name: "Couch Stretch", sets: 2, reps: "45 sec / side", restSec: 15, monogram: "CS" },
      { name: "Seated Forward Fold", sets: 3, reps: "45 sec", restSec: 15, monogram: "SF" },
      { name: "Figure-Four Stretch", sets: 2, reps: "45 sec / side", restSec: 15, monogram: "F4" },
      { name: "Child's Pose", sets: 2, reps: "60 sec", restSec: 10, monogram: "CP" },
    ],
  },
];

export function workoutById(id: string): Workout {
  return WORKOUTS.find((w) => w.id === id) ?? WORKOUTS[0];
}

export function totalSets(workout: Workout): number {
  return workout.exercises.reduce((sum, e) => sum + e.sets, 0);
}

/* ------------------------------------------------------------------ */
/*  Seed history — completed sessions before "today".                  */
/* ------------------------------------------------------------------ */

export interface HistoryEntry {
  id: string;
  workoutId: string;
  workoutName: string;
  category: Category;
  /** 0 = today, 1 = yesterday, … — drives the "this week" maths. */
  dayOffset: number;
  dateLabel: string;
  durationMin: number;
  calories: number;
  exercisesDone: number;
  setsDone: number;
}

export const SEED_HISTORY: HistoryEntry[] = [
  {
    id: "h1",
    workoutId: "hiit-ignite",
    workoutName: "HIIT Ignite",
    category: "HIIT",
    dayOffset: 1,
    dateLabel: "Yesterday",
    durationMin: 20,
    calories: 265,
    exercisesDone: 6,
    setsDone: 21,
  },
  {
    id: "h2",
    workoutId: "upper-body-power",
    workoutName: "Upper Body Power",
    category: "Strength",
    dayOffset: 2,
    dateLabel: "Tue",
    durationMin: 32,
    calories: 285,
    exercisesDone: 5,
    setsDone: 17,
  },
  {
    id: "h3",
    workoutId: "morning-mobility",
    workoutName: "Morning Mobility",
    category: "Mobility",
    dayOffset: 4,
    dateLabel: "Sun",
    durationMin: 18,
    calories: 75,
    exercisesDone: 6,
    setsDone: 13,
  },
  {
    id: "h4",
    workoutId: "leg-day-foundation",
    workoutName: "Leg Day Foundation",
    category: "Strength",
    dayOffset: 8,
    dateLabel: "Last Mon",
    durationMin: 40,
    calories: 340,
    exercisesDone: 6,
    setsDone: 21,
  },
  {
    id: "h5",
    workoutId: "endurance-intervals",
    workoutName: "Endurance Run Intervals",
    category: "Cardio",
    dayOffset: 10,
    dateLabel: "Last Sat",
    durationMin: 30,
    calories: 360,
    exercisesDone: 5,
    setsDone: 18,
  },
  {
    id: "h6",
    workoutId: "core-crusher",
    workoutName: "Core Crusher Express",
    category: "HIIT",
    dayOffset: 12,
    dateLabel: "Last Thu",
    durationMin: 15,
    calories: 120,
    exercisesDone: 5,
    setsDone: 15,
  },
];

/** Today's plan, shown on the Today screen. */
export const TODAYS_WORKOUT_ID = "full-body-strength";

/** Baseline activity for today, before any session logged in the app. */
export const TODAY_BASE = {
  steps: 7480,
  stepGoal: 10000,
  calories: 342,
  activeMin: 21,
};

/** All-time totals before this session (Profile stats build on these). */
export const LIFETIME_BASE = {
  workouts: 128,
  hours: 96.5,
  calories: 41200,
};

/** Current streak in days (fixture). */
export const STREAK_DAYS = 6;

/**
 * Active minutes for the last seven days, oldest first, today last —
 * before anything logged in this session. Today's bar grows live as
 * workouts are completed in the player.
 */
export const WEEK_MINUTES_BASE = [35, 0, 42, 28, 50, 18, TODAY_BASE.activeMin];
