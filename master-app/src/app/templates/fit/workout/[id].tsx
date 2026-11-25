import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button, Card } from "glacia-native";

import { useFit } from "../state";
import { totalSets, workoutById } from "../data";
import { Figure, ListCard, RowSeparator, SectionTitle, T, WorkoutTile } from "../ui";

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
      <Button
        variant="ghost"
        accessibilityLabel="Back to workouts"
        onPress={() => router.back()}
        isDark={fit.darkMode}
        style={styles.backButton}
      >
        Back
      </Button>

      {/* Header */}
      <Card isDark={fit.darkMode} padding={20}>
        <View style={styles.headerRow}>
          <WorkoutTile workout={workout} size={72} />
          <View style={styles.flex1}>
            <T variant="heading">{workout.name}</T>
            <View style={styles.badgeRow}>
              <Badge tone="muted" isDark={fit.darkMode}>
                {workout.category}
              </Badge>
              <Badge tone="muted" isDark={fit.darkMode}>
                {workout.level}
              </Badge>
            </View>
          </View>
        </View>
        <T variant="body" muted style={styles.blurb}>
          {workout.blurb}
        </T>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Figure variant="heading">{workout.durationMin} min</Figure>
            <T variant="caption" muted>
              Duration
            </T>
          </View>
          <View style={styles.metaItem}>
            <Figure variant="heading">{workout.exercises.length}</Figure>
            <T variant="caption" muted>
              Exercises
            </T>
          </View>
          <View style={styles.metaItem}>
            <Figure variant="heading">{totalSets(workout)}</Figure>
            <T variant="caption" muted>
              Total sets
            </T>
          </View>
          <View style={styles.metaItem}>
            <Figure variant="heading">{workout.calories}</Figure>
            <T variant="caption" muted>
              Kcal
            </T>
          </View>
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
          accessibilityLabel={`Start ${workout.name}`}
          onPress={() => router.push(`/templates/fit/player/${workout.id}`)}
          isDark={fit.darkMode}
          style={styles.startButton}
        >
          Start workout
        </Button>
      </Card>

      {/* Exercises */}
      <View>
        <SectionTitle>Exercises</SectionTitle>
        <ListCard>
          {workout.exercises.map((exercise, i) => (
            <View key={exercise.name}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.exerciseRow}>
                <View style={styles.exerciseIndex}>
                  <T variant="body" style={styles.exerciseIndexText}>
                    {exercise.monogram}
                  </T>
                </View>
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
        </ListCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 28,
    gap: 24,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex1: { flex: 1 },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  blurb: { marginTop: 16 },
  metaRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  metaItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  doneBefore: { marginTop: 16, textAlign: "center" },
  startButton: { marginTop: 16 },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  exerciseIndex: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,127,127,0.18)",
  },
  exerciseIndexText: { fontWeight: "600" },
  exerciseMeta: { marginTop: 2 },
});
