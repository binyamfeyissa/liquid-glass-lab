import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Chip } from "glacia-native";

import { useFit } from "../state";
import { CATEGORIES, type Category } from "../data";
import { ListCard, RowSeparator, Screen, WorkoutRow } from "../ui";

export default function WorkoutsScreen() {
  const fit = useFit();
  const [category, setCategory] = useState<"All" | Category>("All");

  const filtered = useMemo(
    () =>
      category === "All"
        ? fit.workouts
        : fit.workouts.filter((w) => w.category === category),
    [fit.workouts, category],
  );

  return (
    <Screen
      title="Workouts"
      subtitle={`${filtered.length} of ${fit.workouts.length} sessions shown`}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={category === c}
            onPress={() => setCategory(c)}
            isDark={fit.darkMode}
          />
        ))}
      </ScrollView>

      <ListCard>
        {filtered.map((workout, i) => (
          <View key={workout.id}>
            {i > 0 ? <RowSeparator /> : null}
            <WorkoutRow
              workout={workout}
              onPress={() => router.push(`/templates/fit/workout/${workout.id}`)}
            />
          </View>
        ))}
      </ListCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    gap: 8,
    paddingRight: 8,
  },
});
