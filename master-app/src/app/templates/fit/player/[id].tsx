import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Progress } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Tick01Icon from "@hugeicons/core-free-icons/Tick01Icon";
import { completionShare, useFit, type LogResult } from "../state";
import { totalSets, workoutById } from "../data";
import { Figure, Stat, T, accentColor } from "../ui";

type Phase = "work" | "rest" | "done";

function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerScreen() {
  const fit = useFit();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = workoutById(id ?? "");
  const total = totalSets(workout);

  const [phase, setPhase] = useState<Phase>("work");
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>(() =>
    workout.exercises.map(() => 0),
  );
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<LogResult | null>(null);
  const loggedRef = useRef(false);

  const exercise = workout.exercises[exerciseIdx];
  const setsDone = completedSets.reduce((a, b) => a + b, 0);
  const isLastSetOverall =
    exerciseIdx === workout.exercises.length - 1 && setIdx === exercise.sets - 1;
  const nextExercise =
    setIdx + 1 < exercise.sets
      ? exercise
      : workout.exercises[exerciseIdx + 1];

  const finish = useCallback(
    (completed: number[]) => {
      if (loggedRef.current) return;
      const sets = completed.reduce((a, b) => a + b, 0);
      if (sets === 0) {
        router.back();
        return;
      }
      const share = completionShare(workout, sets);
      const res: LogResult = {
        durationMin: Math.max(1, Math.round(workout.durationMin * share)),
        calories: Math.round(workout.calories * share),
        exercisesDone: completed.filter(
          (count, i) => count >= workout.exercises[i].sets,
        ).length,
        setsDone: sets,
      };
      loggedRef.current = true;
      fit.logWorkout(workout, res);
      setResult(res);
      setPhase("done");
    },
    [fit, workout],
  );

  const advance = useCallback(() => {
    if (setIdx + 1 < exercise.sets) {
      setSetIdx(setIdx + 1);
    } else {
      setExerciseIdx(exerciseIdx + 1);
      setSetIdx(0);
    }
    setPhase("work");
  }, [exercise, exerciseIdx, setIdx]);

  const completeSet = () => {
    const next = completedSets.slice();
    next[exerciseIdx] += 1;
    setCompletedSets(next);
    if (isLastSetOverall) {
      finish(next);
      return;
    }
    if (exercise.restSec > 0) {
      setRestTotal(exercise.restSec);
      setRestLeft(exercise.restSec);
      setPhase("rest");
    } else {
      advance();
    }
  };

  /* One ticking clock: elapsed time always runs; the rest countdown
     runs during the rest phase and hands over when it reaches zero. */
  useEffect(() => {
    if (phase === "done") return;
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
      if (phase === "rest") setRestLeft((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "rest" && restLeft === 0) advance();
  }, [phase, restLeft, advance]);

  /* ------------------------------ Done ------------------------------ */
  if (phase === "done" && result) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerBlock}>
          <View
            style={[
              styles.doneBadge,
              {
                backgroundColor: fit.darkMode
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          >
            <HugeiconsIcon icon={Tick01Icon} size={28} color={accentColor(fit.darkMode)} />
          </View>
          <T variant="title" style={styles.centerText}>
            Workout complete
          </T>
          <T variant="body" muted style={styles.centerText}>
            {workout.name} is logged and your totals are updated
          </T>
        </View>
        <View style={styles.summaryStrip}>
          <Stat value={`${result.durationMin} min`} label="Duration" />
          <Stat
            value={`${result.exercisesDone}/${workout.exercises.length}`}
            label="Exercises"
          />
          <Stat value={`${result.setsDone}`} label="Sets" />
          <Stat value={`${result.calories}`} label="Kcal" />
        </View>
        <Button
          variant="filled"
          size="lg"
          tint={accentColor(fit.darkMode)}
          accessibilityLabel="Back to Today"
          onPress={() => router.replace("/templates/fit/(tabs)")}
          isDark={fit.darkMode}
          style={styles.fullWidth}
        >
          Back to Today
        </Button>
        <Button
          variant="glass"
          size="lg"
          accessibilityLabel="View activity history"
          onPress={() => router.replace("/templates/fit/(tabs)/activity")}
          isDark={fit.darkMode}
          style={styles.fullWidth}
        >
          View in Activity
        </Button>
      </ScrollView>
    );
  }

  /* --------------------------- Work / Rest --------------------------- */
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* The clock is the hero: big mono elapsed time, like Watch Workout */}
      <View>
        <T variant="caption" muted>
          {workout.name}
        </T>
        <Figure style={styles.elapsedClock}>{clock(elapsed)}</Figure>
      </View>
      <View>
        <Progress
          value={(setsDone / total) * 100}
          tint={accentColor(fit.darkMode)}
          accessibilityLabel={`Workout progress, ${setsDone} of ${total} sets`}
          isDark={fit.darkMode}
        />
        <T variant="caption" muted style={styles.progressCaption}>
          {setsDone} of {total} sets done
        </T>
      </View>

      {phase === "work" ? (
        <View style={styles.stage}>
          <T variant="caption" muted style={styles.centerText}>
            Exercise {exerciseIdx + 1} of {workout.exercises.length}
          </T>
          <T variant="title" style={styles.centerText}>
            {exercise.name}
          </T>
          <Figure variant="heading" style={styles.centerText}>
            Set {setIdx + 1} of {exercise.sets} · {exercise.reps}
          </Figure>
          <View style={styles.setDots}>
            {Array.from({ length: exercise.sets }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.setDot,
                  i < completedSets[exerciseIdx] && {
                    backgroundColor: accentColor(fit.darkMode),
                  },
                  i === setIdx && {
                    borderWidth: 2,
                    borderColor: accentColor(fit.darkMode),
                    backgroundColor: "transparent",
                  },
                ]}
              />
            ))}
          </View>
          <Button
            variant="filled"
            size="lg"
            tint={accentColor(fit.darkMode)}
            accessibilityLabel={
              isLastSetOverall ? "Finish workout" : "Set done, start rest"
            }
            onPress={completeSet}
            isDark={fit.darkMode}
            style={styles.stageButton}
          >
            {isLastSetOverall ? "Finish workout" : "Set done"}
          </Button>
          {nextExercise && nextExercise !== exercise ? (
            <T variant="caption" muted style={styles.centerText}>
              Up next: {nextExercise.name}
            </T>
          ) : null}
        </View>
      ) : (
        <View style={styles.stage}>
          <T variant="caption" muted style={styles.centerText}>
            Rest
          </T>
          <Figure style={styles.restClock}>{clock(restLeft)}</Figure>
          <Progress
            value={restTotal > 0 ? (restLeft / restTotal) * 100 : 0}
            tint={accentColor(fit.darkMode)}
            accessibilityLabel={`Rest timer, ${restLeft} seconds left`}
            isDark={fit.darkMode}
            style={styles.restProgress}
          />
          <T variant="body" muted style={styles.centerText}>
            Next: {nextExercise?.name ?? exercise.name} — set{" "}
            {nextExercise === exercise ? setIdx + 2 : 1} of{" "}
            {(nextExercise ?? exercise).sets}
          </T>
          <View style={styles.restActions}>
            <Button
              variant="glass"
              accessibilityLabel="Add twenty seconds to the rest timer"
              onPress={() => {
                setRestLeft((r) => r + 20);
                setRestTotal((t) => t + 20);
              }}
              isDark={fit.darkMode}
              style={styles.flex1}
            >
              Add 20 sec
            </Button>
            <Button
              variant="filled"
              tint={accentColor(fit.darkMode)}
              accessibilityLabel="Skip the rest and start the next set"
              onPress={advance}
              isDark={fit.darkMode}
              style={styles.flex1}
            >
              Skip rest
            </Button>
          </View>
        </View>
      )}

      <Button
        variant="ghost"
        accessibilityLabel="End workout early and log what is done"
        onPress={() => finish(completedSets)}
        isDark={fit.darkMode}
      >
        End workout early
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 28,
    gap: 16,
  },
  elapsedClock: {
    fontSize: 40,
    lineHeight: 46,
    marginTop: 4,
  },
  progressCaption: {
    marginTop: 8,
  },
  stage: {
    alignItems: "center",
    gap: 16,
    paddingTop: 32,
  },
  centerText: { textAlign: "center" },
  setDots: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
  },
  setDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(127,127,127,0.35)",
  },
  stageButton: {
    alignSelf: "stretch",
    marginTop: 8,
  },
  restClock: {
    fontSize: 72,
    lineHeight: 78,
  },
  restProgress: {
    alignSelf: "stretch",
  },
  restActions: {
    flexDirection: "row",
    gap: 12,
    alignSelf: "stretch",
    marginTop: 8,
  },
  flex1: { flex: 1 },
  fullWidth: {
    alignSelf: "stretch",
  },
  centerBlock: {
    alignItems: "center",
    gap: 12,
    paddingTop: 32,
  },
  doneBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryStrip: {
    flexDirection: "row",
    gap: 12,
  },
});
