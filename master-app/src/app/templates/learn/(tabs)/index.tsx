import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Card, Chip, Progress } from "glacia-native";

import { useLearn } from "../state";
import { CATEGORIES, COURSES, USER_IMAGE, findLesson } from "../data";
import {
  CourseCard,
  Figure,
  SectionTitle,
  Serif,
  T,
  accentColor,
  formatMinutes,
} from "../ui";

export default function HomeScreen() {
  const learn = useLearn();
  const [category, setCategory] = useState<string>("All");

  const found = findLesson(learn.continuePoint.courseId, learn.continuePoint.lessonId);
  const rail = useMemo(
    () =>
      category === "All"
        ? COURSES
        : COURSES.filter((c) => c.category === category),
    [category],
  );
  const goal = Number(learn.dailyGoal) || 20;
  const goalPercent = Math.min(100, Math.round((learn.minutesLearned / goal) * 100));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Learner header — names the place, not a greeting */}
      <View style={styles.header}>
        <Avatar name={learn.userName} source={USER_IMAGE} size="lg" isDark={learn.darkMode} />
        <View style={styles.headerText}>
          <T variant="caption" muted>
            Glasshouse
          </T>
          <T variant="heading">{learn.userName}</T>
        </View>
      </View>

      {/* Streak + today's goal */}
      <Card isDark={learn.darkMode} padding={20}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Figure variant="title">{learn.streakDays}</Figure>
            <T variant="caption" muted>
              day streak
            </T>
          </View>
          <View style={styles.stat}>
            <Figure variant="title">{learn.lessonsCompleted}</Figure>
            <T variant="caption" muted>
              lessons done
            </T>
          </View>
          <View style={styles.stat}>
            <Figure variant="title">{formatMinutes(learn.minutesLearned)}</Figure>
            <T variant="caption" muted>
              learned so far
            </T>
          </View>
        </View>
        <View style={styles.goalBlock}>
          <Progress
            value={goalPercent}
            tint={accentColor(learn.backdrop)}
            isDark={learn.darkMode}
            accessibilityLabel={`Daily goal progress, ${goalPercent} percent`}
          />
          <Figure variant="caption" muted style={styles.goalLabel}>
            {learn.minutesLearned} of {goal} min daily goal
          </Figure>
        </View>
      </Card>

      {/* Continue learning */}
      {found ? (
        <View>
          <SectionTitle>Continue learning</SectionTitle>
          <Card isDark={learn.darkMode} padding={20}>
            <T variant="label" muted>
              {found.course.title}
            </T>
            <Serif variant="heading" style={styles.continueTitle}>
              {found.lesson.title}
            </Serif>
            <T variant="caption" muted>
              Lesson{" "}
              <Figure variant="caption" muted>
                {found.index + 1}
              </Figure>{" "}
              ·{" "}
              <Figure variant="caption" muted>
                {found.lesson.duration} min
              </Figure>{" "}
              ·{" "}
              <Figure variant="caption" muted>
                {learn.progressFor(found.course)}%
              </Figure>{" "}
              of the course done
            </T>
            <Progress
              value={learn.progressFor(found.course)}
              tint={accentColor(learn.backdrop)}
              isDark={learn.darkMode}
              accessibilityLabel={`Course progress, ${learn.progressFor(found.course)} percent`}
              style={styles.continueProgress}
            />
            <Button
              isDark={learn.darkMode}
              accessibilityLabel="Continue this lesson"
              variant="filled"
              onPress={() =>
                router.push(`/templates/learn/lesson/${found.course.id}/${found.lesson.id}`)
              }
              style={styles.continueButton}
            >
              Continue lesson
            </Button>
          </Card>
        </View>
      ) : null}

      {/* Category chips + course rail */}
      <View>
        <SectionTitle>Browse courses</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              isDark={learn.darkMode}
              selected={category === c}
              onSelectedChange={(selected) => {
                if (selected) setCategory(c);
              }}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {rail.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              width={264}
              onPress={() => router.push(`/templates/learn/course/${course.id}`)}
            />
          ))}
          {rail.length === 0 ? (
            <T variant="body" muted>
              No courses in this category yet
            </T>
          ) : null}
        </ScrollView>
      </View>

      {/* Keep going */}
      <View>
        <SectionTitle>Your learning</SectionTitle>
        <Card isDark={learn.darkMode} padding={20}>
          <T variant="body">
            <Figure>{learn.enrolledCourses.length}</Figure> courses in
            progress · <Figure>{learn.coursesCompleted}</Figure> completed
          </T>
          <Button
            isDark={learn.darkMode}
            accessibilityLabel="Go to My Learning"
            onPress={() => router.push("/templates/learn/(tabs)/learning")}
            style={styles.learningButton}
          >
            Open My Learning
          </Button>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 128,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  stat: { flex: 1, gap: 2 },
  goalBlock: { marginTop: 16, gap: 8 },
  goalLabel: { marginTop: 0 },
  continueTitle: { marginTop: 8, marginBottom: 4, lineHeight: 28 },
  continueProgress: { marginTop: 16 },
  continueButton: { marginTop: 16 },
  chipRow: { gap: 8, paddingRight: 4, marginBottom: 16 },
  rail: { gap: 12, paddingRight: 4 },
  learningButton: { marginTop: 16, alignSelf: "flex-start" },
});
