import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, IconButton, colors } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";

import { useFit } from "../state";
import { totalSets, workoutById } from "../data";
import {
  Figure,
  RowSeparator,
  SectionTitle,
  Stat,
  T,
  WorkoutPhoto,
  accentColor,
} from "../ui";

export default function WorkoutDetailScreen() {
  const fit = useFit();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = workoutById(id ?? "");
  const doneBefore = fit.history.filter((h) => h.workoutId === workout.id).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <IconButton
        icon={({ color, size }) => (
          <HugeiconsIcon icon={ChevronLeftIcon} color={color} size={size} />
        )}
        size="md"
        accessibilityLabel="Back to workouts"
        onPress={() => router.back()}
        isDark={fit.darkMode}
        style={styles.backButton}
      />

      {/* Hero — the photo leads, type does the rest */}
      <WorkoutPhoto workout={workout} aspectRatio={4 / 3} />
      <View>
        <T variant="title" style={styles.workoutName}>
          {workout.name}
        </T>
        <T variant="caption" muted style={styles.workoutMeta}>
          {workout.category} · {workout.level}
        </T>
        <T variant="body" muted style={styles.blurb}>
          {workout.blurb}
        </T>
      </View>

      {/* The spec, ruled like a table */}
      <View>
        <RowSeparator />
        <View style={styles.metaStrip}>
          <Stat value={`${workout.durationMin} min`} label="Duration" />
          <Stat value={`${workout.exercises.length}`} label="Exercises" />
          <Stat value={`${totalSets(workout)}`} label="Total sets" />
          <Stat value={`${workout.calories}`} label="Kcal" />
        </View>
        <RowSeparator />
      </View>

      {doneBefore > 0 ? (
        <T variant="caption" muted style={styles.doneBefore}>
          You have completed this workout {doneBefore}{" "}
          {doneBefore === 1 ? "time" : "times"}
        </T>
      ) : null}
      <Button
        variant="filled"
        size="lg"
        tint={accentColor(fit.darkMode)}
        accessibilityLabel={`Start ${workout.name}`}
        onPress={() => router.push(`/templates/fit/player/${workout.id}`)}
        isDark={fit.darkMode}
        style={styles.startButton}
      >
        Start workout
      </Button>

      {/* Exercises — a numbered sequence, not a stack of cards */}
      <View>
        <SectionTitle>Exercises</SectionTitle>
        {workout.exercises.map((exercise, i) => (
          <View key={exercise.name}>
            {i > 0 ? <RowSeparator /> : null}
            <View style={styles.exerciseRow}>
              <Figure
                variant="body"
                style={{
                  color: colors[fit.darkMode ? "dark" : "light"].muted,
                  minWidth: 24,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </Figure>
              <View style={styles.flex1}>
                <T variant="body">{exercise.name}</T>
                <T variant="caption" muted style={styles.exerciseMeta}>
                  Rest {exercise.restSec}s between sets
                </T>
              </View>
              <Figure variant="body">
                {exercise.sets} × {exercise.reps}
              </Figure>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 28,
    gap: 24,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  workoutName: {},
  workoutMeta: { marginTop: 4 },
  blurb: { marginTop: 8 },
  metaStrip: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
  },
  doneBefore: { textAlign: "center" },
  startButton: {
    alignSelf: "stretch",
  },
  flex1: { flex: 1 },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  exerciseMeta: { marginTop: 2 },
});
