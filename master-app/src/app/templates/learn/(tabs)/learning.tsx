import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card } from "glacia-native";

import { useLearn } from "../state";
import { QUIZ_COURSE_ID, findCourse } from "../data";
import {
  CourseCard,
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  Serif,
  T,
  initialsOfTitle,
  plateColor,
} from "../ui";

export default function LearningScreen() {
  const learn = useLearn();
  const inProgress = learn.enrolledCourses.filter(
    (c) => !learn.isCourseComplete(c),
  );
  const completedCourses = learn.enrolledCourses.filter((c) =>
    learn.isCourseComplete(c),
  );
  const quiz = learn.quizResults[QUIZ_COURSE_ID];
  const quizCourse = findCourse(QUIZ_COURSE_ID);
  const hasCertificates =
    completedCourses.length > 0 || (quiz && quiz.passed && quizCourse);

  return (
    <Screen
      title="My Learning"
      subtitle="Everything you are enrolled in, with progress from the lessons you finish"
    >
      <View>
        <SectionTitle>In progress</SectionTitle>
        {inProgress.length > 0 ? (
          <View style={styles.list}>
            {inProgress.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => router.push(`/templates/learn/course/${course.id}`)}
              />
            ))}
          </View>
        ) : (
          <Card isDark={learn.darkMode} padding={20}>
            <T variant="body">
              {learn.enrolledCourses.length === 0
                ? "You are not enrolled in anything yet"
                : "Nothing in progress — every enrolled course is finished"}
            </T>
            <Button
              isDark={learn.darkMode}
              accessibilityLabel="Browse courses in Discover"
              variant="filled"
              onPress={() => router.push("/templates/learn/(tabs)/discover")}
              style={styles.browseButton}
            >
              Browse courses
            </Button>
          </Card>
        )}
      </View>

      <View>
        <SectionTitle>Certificates</SectionTitle>
        {hasCertificates ? (
          <ListCard>
            {completedCourses.map((course, i) => (
              <React.Fragment key={course.id}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.certRow}>
                  <View
                    style={[
                      styles.certPlate,
                      { backgroundColor: plateColor(course, learn.backdrop) },
                    ]}
                  >
                    <Serif
                      variant="label"
                      style={{
                        color: learn.backdrop === "light" ? "#1f1b16" : "#f7f4ee",
                      }}
                    >
                      {initialsOfTitle(course.title)}
                    </Serif>
                  </View>
                  <View style={styles.certText}>
                    <Serif variant="body">{course.title}</Serif>
                    <T variant="caption" muted>
                      Course certificate · all lessons completed
                    </T>
                  </View>
                  <Badge tone="muted" isDark={learn.darkMode}>
                    Earned
                  </Badge>
                </View>
              </React.Fragment>
            ))}
            {quiz && quiz.passed && quizCourse ? (
              <React.Fragment>
                {completedCourses.length > 0 ? <RowSeparator /> : null}
                <View style={styles.certRow}>
                  <View
                    style={[
                      styles.certPlate,
                      { backgroundColor: plateColor(quizCourse, learn.backdrop) },
                    ]}
                  >
                    <Serif
                      variant="label"
                      style={{
                        color: learn.backdrop === "light" ? "#1f1b16" : "#f7f4ee",
                      }}
                    >
                      {initialsOfTitle(quizCourse.title)}
                    </Serif>
                  </View>
                  <View style={styles.certText}>
                    <Serif variant="body">{quizCourse.title} — Quiz</Serif>
                    <T variant="caption" muted>
                      Passed with{" "}
                      <Figure variant="caption" muted>
                        {quiz.correct}
                      </Figure>{" "}
                      of{" "}
                      <Figure variant="caption" muted>
                        {quiz.total}
                      </Figure>{" "}
                      (
                      <Figure variant="caption" muted>
                        {quiz.percent}%
                      </Figure>
                      )
                    </T>
                  </View>
                  <Badge tone="muted" isDark={learn.darkMode}>
                    Earned
                  </Badge>
                </View>
              </React.Fragment>
            ) : null}
          </ListCard>
        ) : (
          <Card isDark={learn.darkMode} padding={20}>
            <T variant="body" muted>
              No certificates yet. Finish every lesson in a course — or pass
              the Liquid Glass quiz with{" "}
              <Figure>80%</Figure> or more — and your certificates will
              appear here
            </T>
            {quizCourse ? (
              <Button
                isDark={learn.darkMode}
                accessibilityLabel="Take the Liquid Glass quiz"
                onPress={() => router.push(`/templates/learn/quiz/${quizCourse.id}`)}
                style={styles.browseButton}
              >
                Take the Liquid Glass quiz
              </Button>
            ) : null}
          </Card>
        )}
      </View>

      {quiz && !quiz.passed ? (
        <View>
          <SectionTitle>Quiz attempts</SectionTitle>
          <ListCard>
            <NavRow
              title={`${quizCourse?.title ?? "Course"} quiz`}
              description={`Last attempt: ${quiz.correct} of ${quiz.total} (${quiz.percent}%) — 80% needed to pass`}
              detail="Retake"
              onPress={() => router.push(`/templates/learn/quiz/${QUIZ_COURSE_ID}`)}
            />
          </ListCard>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  browseButton: { marginTop: 16, alignSelf: "flex-start" },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  certPlate: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  certText: { flex: 1 },
});
