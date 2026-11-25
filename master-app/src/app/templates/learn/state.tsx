import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  COURSES,
  courseLessons,
  findCourse,
  type Course,
} from "./data";

/**
 * The whole template keeps its data in this one client-side store. There
 * is no backend and no persistence: state lives in memory for the session,
 * so finishing a lesson on the player immediately moves the progress bars
 * on Home and My Learning. Restarting the app resets the fixtures.
 */

export interface QuizResult {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
}

export interface ContinuePoint {
  courseId: string;
  lessonId: string;
}

/** The three backgrounds: graphite dark, broken-white light, palm photo. */
export type BackdropMode = "dark" | "light" | "image";

interface LearnState {
  userName: string;

  /** Course ids the learner is enrolled in, most recent last. */
  enrolledIds: string[];
  isEnrolled: (courseId: string) => boolean;
  enrol: (courseId: string) => void;
  enrolledCourses: Course[];

  completedLessonIds: ReadonlySet<string>;
  isLessonComplete: (lessonId: string) => boolean;
  completeLesson: (lessonId: string) => void;

  /** 0–100 for one course, from the store's completed set. */
  progressFor: (course: Course) => number;
  isCourseComplete: (course: Course) => boolean;
  completedCountFor: (course: Course) => number;

  /** Where "Continue learning" points: the lesson in progress. */
  continuePoint: ContinuePoint;
  setContinuePoint: (point: ContinuePoint) => void;

  quizResults: Record<string, QuizResult>;
  recordQuiz: (courseId: string, result: QuizResult) => void;

  /** Derived learner stats, all computed from the store. */
  lessonsCompleted: number;
  minutesLearned: number;
  coursesCompleted: number;
  streakDays: number;

  /** Settings. */
  dailyGoal: string;
  setDailyGoal: (value: string) => void;
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  lessonReminders: boolean;
  setLessonReminders: (value: boolean) => void;
  newCourseAlerts: boolean;
  setNewCourseAlerts: (value: boolean) => void;
  weeklyDigest: boolean;
  setWeeklyDigest: (value: boolean) => void;
}

const LearnContext = createContext<LearnState | null>(null);

/** Seed progress: two lessons of the design course already finished. */
const SEED_COMPLETED = ["lg-1-1", "lg-1-2"];
const SEED_ENROLLED = ["liquid-glass", "react-native-craft"];
const SEED_CONTINUE: ContinuePoint = {
  courseId: "liquid-glass",
  lessonId: "lg-1-3",
};

export function LearnProvider({ children }: { children: ReactNode }) {
  const [enrolledIds, setEnrolledIds] = useState<string[]>(SEED_ENROLLED);
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(SEED_COMPLETED),
  );
  const [continuePoint, setContinuePoint] = useState<ContinuePoint>(SEED_CONTINUE);
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});
  const [dailyGoal, setDailyGoal] = useState("20");
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [lessonReminders, setLessonReminders] = useState(true);
  const [newCourseAlerts, setNewCourseAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const isEnrolled = useCallback(
    (courseId: string) => enrolledIds.includes(courseId),
    [enrolledIds],
  );

  const enrol = useCallback((courseId: string) => {
    setEnrolledIds((prev) =>
      prev.includes(courseId) ? prev : [...prev, courseId],
    );
  }, []);

  const isLessonComplete = useCallback(
    (lessonId: string) => completed.has(lessonId),
    [completed],
  );

  const completeLesson = useCallback((lessonId: string) => {
    setCompleted((prev) => {
      if (prev.has(lessonId)) return prev;
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });
  }, []);

  const recordQuiz = useCallback((courseId: string, result: QuizResult) => {
    setQuizResults((prev) => ({ ...prev, [courseId]: result }));
  }, []);

  const value = useMemo<LearnState>(() => {
    const enrolledCourses = enrolledIds
      .map((id) => findCourse(id))
      .filter((c): c is Course => !!c);

    const completedCountFor = (course: Course) =>
      courseLessons(course).filter((l) => completed.has(l.id)).length;

    const progressFor = (course: Course) => {
      const lessons = courseLessons(course);
      if (lessons.length === 0) return 0;
      return Math.round((completedCountFor(course) / lessons.length) * 100);
    };

    const isCourseComplete = (course: Course) =>
      courseLessons(course).length > 0 &&
      courseLessons(course).every((l) => completed.has(l.id));

    let lessonsCompleted = 0;
    let minutesLearned = 0;
    for (const course of COURSES) {
      for (const lesson of courseLessons(course)) {
        if (completed.has(lesson.id)) {
          lessonsCompleted += 1;
          minutesLearned += lesson.duration;
        }
      }
    }

    return {
      userName: "Jordan Ellis",
      enrolledIds,
      isEnrolled,
      enrol,
      enrolledCourses,
      completedLessonIds: completed,
      isLessonComplete,
      completeLesson,
      progressFor,
      isCourseComplete,
      completedCountFor,
      continuePoint,
      setContinuePoint,
      quizResults,
      recordQuiz,
      lessonsCompleted,
      minutesLearned,
      coursesCompleted: COURSES.filter(isCourseComplete).length,
      streakDays: 6,
      dailyGoal,
      setDailyGoal,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      lessonReminders,
      setLessonReminders,
      newCourseAlerts,
      setNewCourseAlerts,
      weeklyDigest,
      setWeeklyDigest,
    };
  }, [
    enrolledIds,
    isEnrolled,
    enrol,
    completed,
    isLessonComplete,
    completeLesson,
    continuePoint,
    quizResults,
    recordQuiz,
    dailyGoal,
    backdrop,
    setDarkMode,
    lessonReminders,
    newCourseAlerts,
    weeklyDigest,
  ]);

  return <LearnContext.Provider value={value}>{children}</LearnContext.Provider>;
}

export function useLearn(): LearnState {
  const ctx = useContext(LearnContext);
  if (!ctx) throw new Error("useLearn must be used inside LearnProvider");
  return ctx;
}
