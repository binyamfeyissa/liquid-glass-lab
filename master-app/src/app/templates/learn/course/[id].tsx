import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  colors,
  Avatar, Badge, Button, Card, Progress
} from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { useLearn } from "../state";
import {
  QUIZ_COURSE_ID,
  courseLessons,
  courseMinutes,
  findCourse,
  type Lesson,
} from "../data";
import {
  CourseCover,
  Figure,
  ListCard,
  RowSeparator,
  SectionTitle,
  Serif,
  T,
  accentColor,
  formatMinutes,
} from "../ui";

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const learn = useLearn();
  const course = findCourse(id ?? "");

  if (!course) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <T variant="title">Course not found</T>
        <T variant="body" muted style={styles.spaced}>
          This course is no longer in the catalogue.
        </T>
        <Button
          isDark={learn.darkMode}
          accessibilityLabel="Back to Discover"
          variant="glass"
          onPress={() => router.replace("/templates/learn/(tabs)/discover")}
        >
          Browse courses
        </Button>
      </ScrollView>
    );
  }

  const lessons = courseLessons(course);
  const enrolled = learn.isEnrolled(course.id);
  const progress = learn.progressFor(course);
  const complete = learn.isCourseComplete(course);
  const firstIncomplete =
    lessons.find((l) => !learn.isLessonComplete(l.id)) ?? lessons[lessons.length - 1];
  const quiz = learn.quizResults[course.id];
  const hasQuiz = course.id === QUIZ_COURSE_ID;

  const openLesson = (lesson: Lesson) => {
    if (!enrolled) learn.enrol(course.id);
    learn.setContinuePoint({ courseId: course.id, lessonId: lesson.id });
    router.push(`/templates/learn/lesson/${course.id}/${lesson.id}`);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Button
        accessibilityLabel="Go back"
        variant="ghost"
        onPress={() => router.back()}
        isDark={learn.darkMode}
      >
        Back
      </Button>

      <Card isDark={learn.darkMode} padding={0}>
        <CourseCover course={course} height={150} />
      </Card>

      <View>
        <View style={styles.metaRow}>
          <Badge tone="muted" isDark={learn.darkMode}>
            {course.category}
          </Badge>
          <Badge tone="muted" isDark={learn.darkMode}>
            {course.level}
          </Badge>
          <T variant="caption" muted>
            <Figure variant="caption" muted>
              {course.rating.toFixed(1)}
            </Figure>{" "}
            · {course.reviews} reviews
          </T>
        </View>
        <Serif variant="title" style={styles.title}>
          {course.title}
        </Serif>
        <T variant="body" muted style={styles.tagline}>
          {course.tagline.replace(/\.$/, "")}
        </T>
        <T variant="caption" muted>
          <Figure variant="caption" muted>
            {lessons.length}
          </Figure>{" "}
          lessons ·{" "}
          <Figure variant="caption" muted>
            {formatMinutes(courseMinutes(course))}
          </Figure>{" "}
          of content · by {course.instructor.name}
        </T>
      </View>

      {/* Enrol / progress */}
      <Card isDark={learn.darkMode} padding={20}>
        {enrolled ? (
          <>
            <View style={styles.progressHead}>
              <T variant="heading">{complete ? "Course complete" : "Your progress"}</T>
              <Figure variant="heading">{progress}%</Figure>
            </View>
            <Progress
              value={progress}
              tint={accentColor(learn.backdrop)}
              isDark={learn.darkMode}
              accessibilityLabel={`Course progress, ${progress} percent`}
              style={styles.progressBar}
            />
            <T variant="caption" muted>
              <Figure variant="caption" muted>
                {learn.completedCountFor(course)}
              </Figure>{" "}
              of{" "}
              <Figure variant="caption" muted>
                {lessons.length}
              </Figure>{" "}
              lessons completed
            </T>
            {!complete && firstIncomplete ? (
              <Button
                isDark={learn.darkMode}
                accessibilityLabel="Continue with the next lesson"
                variant="filled"
                onPress={() => openLesson(firstIncomplete)}
                style={styles.cta}
              >{`Continue: ${firstIncomplete.title}`}</Button>
            ) : null}
          </>
        ) : (
          <>
            <T variant="heading">Start learning — free</T>
            <T variant="body" muted style={styles.enrolHint}>
              Enrol to track your progress lesson by lesson. The course
              appears in My Learning straight away.
            </T>
            <Button
              isDark={learn.darkMode}
              accessibilityLabel="Enrol in this course"
              variant="filled"
              onPress={() => learn.enrol(course.id)}
              style={styles.cta}
            >
              Enrol in this course
            </Button>
          </>
        )}
      </Card>

      {/* Quiz */}
      {hasQuiz ? (
        <Card isDark={learn.darkMode} padding={20}>
          <View style={styles.progressHead}>
            <T variant="heading">Check your understanding</T>
            {quiz ? (
              <Badge tone="muted" isDark={learn.darkMode}>
                {quiz.passed ? "Passed" : `${quiz.percent}%`}
              </Badge>
            ) : null}
          </View>
          <T variant="body" muted style={styles.enrolHint}>
            {quiz
              ? `Last attempt: ${quiz.correct} of ${quiz.total} correct (${quiz.percent}%). ${
                  quiz.passed
                    ? "Certificate earned — see My Learning."
                    : "80% needed to pass. Retakes are unlimited."
                }`
              : "Five questions on the material stack, surface profiles and contrast budgets. Score 80% or more to earn the quiz certificate."}
          </T>
          <Button
            isDark={learn.darkMode}
            accessibilityLabel={quiz ? "Retake the quiz" : "Start the quiz"}
            variant={quiz ? "glass" : "filled"}
            onPress={() => router.push(`/templates/learn/quiz/${course.id}`)}
            style={styles.cta}
          >
            {quiz ? "Retake the quiz" : "Start the quiz"}
          </Button>
        </Card>
      ) : null}

      {/* Instructor */}
      <View>
        <SectionTitle>Your instructor</SectionTitle>
        <Card isDark={learn.darkMode} padding={20}>
          <View style={styles.instructorHead}>
            <Avatar name={course.instructor.name} size="lg" isDark={learn.darkMode} />
            <View style={styles.instructorText}>
              <T variant="heading">{course.instructor.name}</T>
              <T variant="caption" muted>
                {course.instructor.role}
              </T>
              <T variant="caption" muted>
                {course.instructor.courses} courses · {course.instructor.students} students
              </T>
            </View>
          </View>
          <T variant="body" muted style={styles.instructorBio}>
            {course.instructor.bio}
          </T>
        </Card>
      </View>

      {/* Curriculum */}
      <View>
        <SectionTitle>Curriculum</SectionTitle>
        {course.sections.map((section, sIdx) => (
          <View key={section.title} style={sIdx > 0 ? styles.sectionSpaced : undefined}>
            <T variant="label" style={styles.sectionLabel}>
              <Figure variant="label">{sIdx + 1}</Figure>
              {"  "}
              <Serif variant="label">{section.title}</Serif>
            </T>
            <ListCard>
              {section.lessons.map((lesson, lIdx) => {
                const done = learn.isLessonComplete(lesson.id);
                return (
                  <React.Fragment key={lesson.id}>
                    {lIdx > 0 ? <RowSeparator /> : null}
                    <Pressable
                      onPress={() => openLesson(lesson)}
                      accessibilityRole="button"
                      accessibilityLabel={`${lesson.title}, ${lesson.duration} minutes${done ? ", completed" : ""}`}
                      style={({ pressed }) => [
                        styles.lessonRow,
                        pressed && {
                          backgroundColor: learn.darkMode
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.05)",
                        },
                      ]}
                    >
                      <View style={styles.lessonGlyph}>
                        <Figure
                          variant="body"
                          style={done ? { color: accentColor(learn.backdrop) } : undefined}
                        >
                          {lIdx + 1}
                        </Figure>
                      </View>
                      <View style={styles.lessonText}>
                        <T variant="body" numberOfLines={2}>
                          {lesson.title}
                        </T>
                        <T variant="caption" muted>
                          {lesson.type} ·{" "}
                          <Figure variant="caption" muted>
                            {lesson.duration} min
                          </Figure>
                        </T>
                      </View>
                      {done ? (
                        <Badge tone="muted" isDark={learn.darkMode}>
                          Done
                        </Badge>
                      ) : (
                        <ChevronRight size={18} color={learn.darkMode ? colors.dark.muted : colors.light.muted} />
                      )}
                    </Pressable>
                  </React.Fragment>
                );
              })}
            </ListCard>
          </View>
        ))}
        {!enrolled ? (
          <T variant="caption" muted style={styles.footnote}>
            Tapping any lesson enrols you in the course automatically
          </T>
        ) : null}
      </View>
    </ScrollView>
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
  spaced: { marginVertical: 12 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: { marginTop: 12, lineHeight: 36 },
  tagline: { marginTop: 8, marginBottom: 10 },
  progressHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  progressBar: { marginTop: 16, marginBottom: 8 },
  cta: { marginTop: 16 },
  enrolHint: { marginTop: 8 },
  instructorHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  instructorText: { flex: 1, gap: 2 },
  instructorBio: { marginTop: 16 },
  sectionSpaced: { marginTop: 20 },
  sectionLabel: { marginBottom: 8 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  lessonGlyph: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,127,127,0.18)",
  },
  lessonText: { flex: 1 },
  footnote: { marginTop: 12, textAlign: "center" },
});
