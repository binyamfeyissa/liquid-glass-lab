import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button, Card, Progress } from "glacia-native";

import { useLearn } from "../state";
import { QUIZ, QUIZ_PASS_PERCENT, findCourse } from "../data";
import { Figure, Serif, T, accentColor } from "../ui";

type Phase = "intro" | "question" | "result";

export default function QuizScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const learn = useLearn();
  const course = findCourse(courseId ?? "");
  const previous = course ? learn.quizResults[course.id] : undefined;

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  if (!course) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <T variant="title">Quiz not found</T>
        <T variant="body" muted style={styles.spaced}>
          This course does not have a quiz.
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

  const total = QUIZ.length;
  const percent = Math.round((correctCount / total) * 100);
  const passed = percent >= QUIZ_PASS_PERCENT;
  const question = QUIZ[index];
  const answered = selected !== null;
  const selectedCorrect = answered && selected === question.answer;

  const start = () => {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setPhase("question");
  };

  const choose = (optionIndex: number) => {
    if (answered) return;
    setSelected(optionIndex);
    if (optionIndex === question.answer) {
      setCorrectCount((c) => c + 1);
    }
  };

  const next = () => {
    if (index + 1 >= total) {
      learn.recordQuiz(course.id, {
        correct: correctCount,
        total,
        percent,
        passed,
      });
      setPhase("result");
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Button
        accessibilityLabel="Go back to the course"
        variant="ghost"
        onPress={() => router.back()}
        isDark={learn.darkMode}
      >
        {course.title}
      </Button>

      {phase === "intro" ? (
        <>
          <View>
            <Badge tone="muted" isDark={learn.darkMode} style={styles.introBadge}>
              Course quiz
            </Badge>
            <Serif variant="title" style={styles.title}>
              Check your understanding
            </Serif>
            <T variant="body" muted style={styles.spaced}>
              {total} questions on the material stack, surface profiles and
              contrast budgets. Answer one at a time — you see immediately
              whether you were right, and why.
            </T>
            <T variant="body" muted>
              Score {QUIZ_PASS_PERCENT}% or more to pass and earn the quiz
              certificate in My Learning. Retakes are unlimited.
            </T>
          </View>
          {previous ? (
            <Card isDark={learn.darkMode} padding={20}>
              <View style={styles.rowBetween}>
                <T variant="heading">Your last attempt</T>
                <Badge tone="muted" isDark={learn.darkMode}>
                  {previous.passed ? "Passed" : "Not passed"}
                </Badge>
              </View>
              <T variant="body" muted style={styles.spaced}>
                <Figure>
                  {previous.correct}
                </Figure>{" "}
                of{" "}
                <Figure>{previous.total}</Figure> correct (
                <Figure>{previous.percent}%</Figure>)
              </T>
            </Card>
          ) : null}
          <Button isDark={learn.darkMode} accessibilityLabel="Start the quiz" variant="filled" onPress={start}>
            {previous ? "Retake the quiz" : "Start the quiz"}
          </Button>
        </>
      ) : null}

      {phase === "question" && question ? (
        <>
          <View>
            <View style={styles.rowBetween}>
              <T variant="label" muted>
                Question{" "}
                <Figure variant="label" muted>
                  {index + 1}
                </Figure>{" "}
                of{" "}
                <Figure variant="label" muted>
                  {total}
                </Figure>
              </T>
              <T variant="caption" muted>
                <Figure variant="caption" muted>
                  {correctCount}
                </Figure>{" "}
                correct so far
              </T>
            </View>
            <Progress
              value={Math.round(((index + (answered ? 1 : 0)) / total) * 100)}
              tint={accentColor(learn.backdrop)}
              isDark={learn.darkMode}
              accessibilityLabel={`Quiz progress, question ${index + 1} of ${total}`}
              style={styles.progress}
            />
            <T variant="heading" style={styles.questionText}>
              {question.question}
            </T>
          </View>

          <View style={styles.options}>
            {question.options.map((option, i) => {
              const isAnswer = i === question.answer;
              const isChosen = i === selected;
              const correctColor =
                learn.backdrop === "light" ? "#177245" : "#3fae7c";
              const wrongColor =
                learn.backdrop === "light" ? "#b3261e" : "#e0655a";
              const stateStyle = !answered
                ? undefined
                : isAnswer
                  ? { borderColor: correctColor, borderWidth: 2 }
                  : isChosen
                    ? { borderColor: wrongColor, borderWidth: 2 }
                    : styles.optionDim;
              return (
                <Pressable
                  key={i}
                  onPress={() => choose(i)}
                  disabled={answered}
                  accessibilityRole="button"
                  accessibilityLabel={`Option ${i + 1}: ${option}`}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: learn.darkMode
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(255,255,255,0.55)",
                      borderColor: learn.darkMode
                        ? "rgba(255,255,255,0.14)"
                        : "rgba(0,0,0,0.10)",
                    },
                    stateStyle,
                    pressed && !answered && styles.optionPressed,
                  ]}
                >
                  <View style={styles.optionLetter}>
                    <T variant="label">{"ABCD"[i]}</T>
                  </View>
                  <T variant="body" style={styles.optionText}>
                    {option}
                  </T>
                </Pressable>
              );
            })}
          </View>

          {answered ? (
            <Card isDark={learn.darkMode} padding={20}>
              <Badge tone="muted" isDark={learn.darkMode} style={styles.feedbackBadge}>
                {selectedCorrect ? "Correct" : "Not quite"}
              </Badge>
              <T variant="body" muted style={styles.spaced}>
                {question.explanation}
              </T>
              <Button
                isDark={learn.darkMode}
                accessibilityLabel={index + 1 >= total ? "See my result" : "Next question"}
                variant="filled"
                onPress={next}
                style={styles.nextButton}
              >
                {index + 1 >= total ? "See my result" : "Next question"}
              </Button>
            </Card>
          ) : (
            <T variant="caption" muted style={styles.hint}>
              Tap an answer to check it.
            </T>
          )}
        </>
      ) : null}

      {phase === "result" ? (
        <>
          <View style={styles.resultHead}>
            <Serif variant="title">{passed ? "You passed" : "So close"}</Serif>
            <T variant="body" muted style={styles.spaced}>
              <Figure>
                {correctCount}
              </Figure>{" "}
              of <Figure>{total}</Figure> correct — <Figure>{percent}%</Figure>.{" "}
              {passed
                ? `That clears the ${QUIZ_PASS_PERCENT}% bar.`
                : `You need ${QUIZ_PASS_PERCENT}% to pass. Review the lesson notes and try again — retakes are unlimited.`}
            </T>
          </View>

          {passed ? (
            <View
              style={[
                styles.certificate,
                {
                  backgroundColor:
                    learn.backdrop === "light" ? "#fdfbf7" : "#1d1a16",
                  borderColor:
                    learn.backdrop === "light"
                      ? "rgba(31,27,22,0.14)"
                      : "rgba(247,244,238,0.16)",
                },
              ]}
            >
              <T variant="label" muted>
                Certificate of achievement
              </T>
              <View
                style={[
                  styles.certRule,
                  { backgroundColor: accentColor(learn.backdrop) },
                ]}
              />
              <Serif variant="heading" style={styles.certCourse}>
                {course.title}
              </Serif>
              <T variant="body" muted>
                Quiz passed by {learn.userName} ·{" "}
                <Figure>
                  {correctCount}
                </Figure>{" "}
                of <Figure>{total}</Figure> (<Figure>{percent}%</Figure>)
              </T>
              <T variant="caption" muted style={styles.certFoot}>
                Glasshouse · also filed under Certificates in My Learning
              </T>
            </View>
          ) : null}

          <View style={styles.resultActions}>
            <Button
              isDark={learn.darkMode}
              accessibilityLabel="Retake the quiz"
              variant={passed ? "glass" : "filled"}
              onPress={start}
            >
              Retake the quiz
            </Button>
            <Button
              isDark={learn.darkMode}
              accessibilityLabel="Back to the course"
              variant={passed ? "filled" : "glass"}
              onPress={() => router.replace(`/templates/learn/course/${course.id}`)}
            >
              Back to the course
            </Button>
            {passed ? (
              <Button
                isDark={learn.darkMode}
                accessibilityLabel="View certificates in My Learning"
                onPress={() => router.replace("/templates/learn/(tabs)/learning")}
              >
                View in My Learning
              </Button>
            ) : null}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
    gap: 24,
  },
  spaced: { marginVertical: 12 },
  introBadge: { alignSelf: "flex-start" },
  title: { marginTop: 12, lineHeight: 36 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progress: { marginTop: 12 },
  questionText: { marginTop: 16, lineHeight: 28 },
  options: { gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionPressed: { opacity: 0.75 },
  optionDim: { opacity: 0.55 },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,127,127,0.20)",
  },
  optionText: { flex: 1 },
  feedbackBadge: { alignSelf: "flex-start" },
  nextButton: { marginTop: 16 },
  hint: { textAlign: "center" },
  resultHead: { alignItems: "flex-start" },
  certificate: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  certRule: { width: 48, height: 2, borderRadius: 1 },
  certCourse: { textAlign: "center", lineHeight: 28 },
  certFoot: { marginTop: 8 },
  resultActions: { gap: 12 },
});
