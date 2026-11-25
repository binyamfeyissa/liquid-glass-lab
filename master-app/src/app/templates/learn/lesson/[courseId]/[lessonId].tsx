import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button, Card, Progress, Slider } from "glacia-native";

import { useLearn } from "../../state";
import { QUIZ_COURSE_ID, courseLessons, findLesson } from "../../data";
import {
  Figure,
  SectionTitle,
  Serif,
  T,
  accentColor,
  plateColor,
} from "../../ui";

/** Simulated playback speed: a 6-minute lesson plays through in ~15 s. */
const SPEED = 24;
const TICK_SECONDS = 0.25;

function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${rest.toString().padStart(2, "0")}`;
}

export default function LessonScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{
    courseId: string;
    lessonId: string;
  }>();
  const learn = useLearn();
  const found = findLesson(courseId ?? "", lessonId ?? "");

  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const wasComplete = useRef(false);

  const lessonKey = found?.lesson.id;
  const durationSeconds = found ? found.lesson.duration * 60 : 0;

  /* Reset the player whenever a different lesson is opened, and point
     "Continue learning" at it. */
  useEffect(() => {
    if (!found) return;
    setPosition(0);
    setPlaying(false);
    setFinished(false);
    wasComplete.current = learn.isLessonComplete(found.lesson.id);
    learn.setContinuePoint({ courseId: found.course.id, lessonId: found.lesson.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonKey]);

  /* The playback clock. */
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPosition((p) => Math.min(durationSeconds, p + TICK_SECONDS * SPEED));
    }, TICK_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [playing, durationSeconds]);

  /* Reaching the end finishes the lesson. */
  useEffect(() => {
    if (!found || finished || durationSeconds === 0) return;
    if (position >= durationSeconds) {
      setPlaying(false);
      setFinished(true);
      learn.completeLesson(found.lesson.id);
      const lessons = courseLessons(found.course);
      const next = lessons[found.index + 1];
      if (next) {
        learn.setContinuePoint({ courseId: found.course.id, lessonId: next.id });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, durationSeconds, finished, lessonKey]);

  if (!found) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <T variant="title">Lesson not found</T>
        <T variant="body" muted style={styles.spaced}>
          This lesson is no longer in the catalogue.
        </T>
        <Button
          accessibilityLabel="Back to Discover"
          variant="filled"
          onPress={() => router.replace("/templates/learn/(tabs)/discover")}
        >
          Browse courses
        </Button>
      </ScrollView>
    );
  }

  const { course, lesson, index } = found;
  const lessons = courseLessons(course);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const alreadyComplete = learn.isLessonComplete(lesson.id);
  const courseComplete = learn.isCourseComplete(course);
  const percent = durationSeconds
    ? Math.round((position / durationSeconds) * 100)
    : 0;

  const markComplete = () => {
    learn.completeLesson(lesson.id);
    setPlaying(false);
    setFinished(true);
    if (next) {
      learn.setContinuePoint({ courseId: course.id, lessonId: next.id });
    }
  };

  const goTo = (target: (typeof lessons)[number]) => {
    learn.setContinuePoint({ courseId: course.id, lessonId: target.id });
    router.replace(`/templates/learn/lesson/${course.id}/${target.id}`);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back to the course"
        style={styles.back}
      >
        <T variant="body">{course.title}</T>
      </Pressable>

      {/* Simulated video panel — one flat plate, no media assets. */}
      <View style={[styles.panel, { backgroundColor: plateColor(course, learn.backdrop) }]}>
        <Pressable
          onPress={() => {
            if (finished) {
              setPosition(0);
              setFinished(false);
              setPlaying(true);
            } else {
              setPlaying((p) => !p);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={playing ? "Pause lesson" : finished ? "Replay lesson" : "Play lesson"}
          style={styles.playButton}
        >
          <T variant="title" style={styles.playGlyph}>
            {playing ? "❚❚" : finished ? "↻" : "▶"}
          </T>
        </Pressable>
        <View style={styles.panelMeta}>
          <Badge tone="muted" isDark={learn.darkMode}>
            {lesson.type}
          </Badge>
          <T
            variant="caption"
            style={{
              color: learn.backdrop === "light" ? "#1f1b16" : "#f7f4ee",
              opacity: 0.9,
            }}
          >
            {playing
              ? "Playing · simulated at 24×"
              : finished
                ? "Finished"
                : "Simulated playback · 24× speed"}
          </T>
        </View>
      </View>

      {/* Transport */}
      <Card isDark={learn.darkMode} padding={20}>
        <Slider
          value={position}
          min={0}
          max={durationSeconds}
          step={1}
          onValueChange={(v) => {
            setPosition(v);
            if (v < durationSeconds) setFinished(false);
          }}
          accessibilityLabel="Seek through the lesson"
          isDark={learn.darkMode}
        />
        <View style={styles.timeRow}>
          <Figure variant="caption" muted>
            {clock(position)}
          </Figure>
          <Figure variant="caption" muted>
            {percent}% · {clock(durationSeconds - position)} left
          </Figure>
          <Figure variant="caption" muted>
            {clock(durationSeconds)}
          </Figure>
        </View>
        <View style={styles.transportRow}>
          <Button
            accessibilityLabel={playing ? "Pause" : "Play"}
            variant="filled"
            onPress={() => {
              if (finished) {
                setPosition(0);
                setFinished(false);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            style={styles.transportMain}
          >
            {playing ? "Pause" : finished ? "Watch again" : "Play"}
          </Button>
          {alreadyComplete ? (
            <Badge tone="muted" isDark={learn.darkMode}>
              Completed
            </Badge>
          ) : (
            <Button
              accessibilityLabel="Mark this lesson complete"
              onPress={markComplete}
              style={styles.transportSide}
            >
              Mark complete
            </Button>
          )}
        </View>
        {finished && !wasComplete.current ? (
          <T variant="caption" muted style={styles.finishedNote}>
            Lesson complete — your progress on Home and My Learning has been
            updated.
          </T>
        ) : null}
      </Card>

      {/* Course-complete state */}
      {courseComplete ? (
        <Card isDark={learn.darkMode} padding={20}>
          <T variant="title">Course complete</T>
          <T variant="body" muted style={styles.spaced}>
            You have finished every lesson in {course.title}. Your course
            certificate is waiting in My Learning.
          </T>
          <View style={styles.completeActions}>
            <Button
              accessibilityLabel="View certificates in My Learning"
              variant="filled"
              onPress={() => router.replace("/templates/learn/(tabs)/learning")}
              style={styles.completeAction}
            >
              View my certificate
            </Button>
            {course.id === QUIZ_COURSE_ID && !learn.quizResults[course.id]?.passed ? (
              <Button
                accessibilityLabel="Take the course quiz"
                onPress={() => router.push(`/templates/learn/quiz/${course.id}`)}
                style={styles.completeAction}
              >
                Take the quiz
              </Button>
            ) : null}
          </View>
        </Card>
      ) : null}

      {/* Lesson header + notes */}
      <View>
        <T variant="caption" muted>
          Lesson{" "}
          <Figure variant="caption" muted>
            {index + 1}
          </Figure>{" "}
          of{" "}
          <Figure variant="caption" muted>
            {lessons.length}
          </Figure>{" "}
          · {lesson.type} ·{" "}
          <Figure variant="caption" muted>
            {lesson.duration} min
          </Figure>
        </T>
        <Serif variant="title" style={styles.lessonTitle}>
          {lesson.title}
        </Serif>
        <SectionProgress index={index} total={lessons.length} percent={learn.progressFor(course)} dark={learn.darkMode} backdrop={learn.backdrop} />
      </View>

      <Card isDark={learn.darkMode} padding={20}>
        <SectionTitle>Lesson notes</SectionTitle>
        {lesson.notes.map((paragraph, i) => (
          <T key={i} variant="body" style={styles.note}>
            {paragraph}
          </T>
        ))}
      </Card>

      {/* Prev / next */}
      <View style={styles.navRow}>
        <Button
          accessibilityLabel={prev ? `Previous lesson: ${prev.title}` : "No previous lesson"}
          disabled={!prev}
          onPress={() => prev && goTo(prev)}
          style={styles.navButton}
        >
          Previous
        </Button>
        <Button
          accessibilityLabel={next ? `Next lesson: ${next.title}` : "No next lesson"}
          disabled={!next}
          variant="filled"
          onPress={() => next && goTo(next)}
          style={styles.navButton}
        >
          Next
        </Button>
      </View>
      {next ? (
        <T variant="caption" muted style={styles.nextHint}>
          Up next: {next.title} (
          <Figure variant="caption" muted>
            {next.duration} min
          </Figure>
          )
        </T>
      ) : (
        <T variant="caption" muted style={styles.nextHint}>
          This is the final lesson of {course.title}.
        </T>
      )}
    </ScrollView>
  );
}

function SectionProgress({
  index,
  total,
  percent,
  dark,
  backdrop,
}: {
  index: number;
  total: number;
  percent: number;
  dark: boolean;
  backdrop: "dark" | "light" | "image";
}) {
  return (
    <View style={styles.sectionProgress}>
      <Progress
        value={percent}
        tint={accentColor(backdrop)}
        isDark={dark}
        accessibilityLabel={`Course progress, ${percent} percent`}
      />
      <T variant="caption" muted>
        Lesson{" "}
        <Figure variant="caption" muted>
          {index + 1}
        </Figure>{" "}
        of{" "}
        <Figure variant="caption" muted>
          {total}
        </Figure>{" "}
        ·{" "}
        <Figure variant="caption" muted>
          {percent}%
        </Figure>{" "}
        of the course complete
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 24,
  },
  back: { alignSelf: "flex-start", paddingVertical: 4, paddingRight: 12 },
  spaced: { marginVertical: 12 },
  panel: {
    height: 208,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  playGlyph: { color: "#ffffff" },
  panelMeta: {
    position: "absolute",
    left: 16,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  transportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  transportMain: { flex: 1 },
  transportSide: { flex: 1 },
  finishedNote: { marginTop: 12 },
  completeActions: { gap: 12, marginTop: 8 },
  completeAction: { alignSelf: "stretch" },
  lessonTitle: { marginTop: 8, lineHeight: 36 },
  sectionProgress: { marginTop: 16, gap: 8 },
  note: { marginTop: 12, lineHeight: 24 },
  navRow: { flexDirection: "row", gap: 12 },
  navButton: { flex: 1 },
  nextHint: { textAlign: "center" },
});
