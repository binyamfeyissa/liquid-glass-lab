import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, SegmentedControl } from "glacia-native";

import { useFit } from "../state";
import { workoutById, type HistoryEntry } from "../data";
import { Figure, RowSeparator, Screen, Stat, T, WorkoutTile } from "../ui";

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const workout = workoutById(entry.workoutId);
  return (
    <View style={styles.row}>
      <WorkoutTile workout={workout} size={56} />
      <View style={styles.flex1}>
        <T variant="body" numberOfLines={1}>
          {entry.workoutName}
        </T>
        <T variant="caption" muted style={styles.rowMeta}>
          {entry.dateLabel} · {entry.setsDone} sets · {entry.calories} kcal
        </T>
      </View>
      <View style={styles.rowRight}>
        <Figure variant="body">{entry.durationMin} min</Figure>
        <T variant="caption" muted>
          {entry.category}
        </T>
      </View>
    </View>
  );
}

export default function ActivityScreen() {
  const fit = useFit();
  const [range, setRange] = useState(0); // 0 = this week, 1 = all time

  const entries = useMemo(
    () => (range === 0 ? fit.history.filter((h) => h.dayOffset < 7) : fit.history),
    [fit.history, range],
  );
  const totalMin = entries.reduce((s, h) => s + h.durationMin, 0);
  const totalCal = entries.reduce((s, h) => s + h.calories, 0);

  return (
    <Screen belowTabBar title="Activity">
      {/* The totals are the summary: big figures first, like Health */}
      <View style={styles.summaryStrip}>
        <Stat value={`${entries.length}`} label="Workouts" variant="title" />
        <Stat value={`${totalMin}`} label="Minutes" variant="title" />
        <Stat value={`${totalCal.toLocaleString("en-US")}`} label="Kcal" variant="title" />
      </View>

      <SegmentedControl
        segments={["This week", "All logged"]}
        selectedIndex={range}
        onChange={setRange}
        accessibilityLabel="History range"
        isDark={fit.darkMode}
      />

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <T variant="heading">Nothing here yet</T>
          <T variant="body" muted style={styles.emptyText}>
            Finish a workout in the player and it will show up here.
          </T>
          <Button
            variant="ghost"
            accessibilityLabel="Browse workouts"
            onPress={() => router.push("/templates/fit/(tabs)/workouts")}
            isDark={fit.darkMode}
          >
            Browse workouts
          </Button>
        </View>
      ) : (
        <View>
          {entries.map((entry, i) => (
            <View key={entry.id}>
              {i > 0 ? <RowSeparator /> : null}
              <HistoryRow entry={entry} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryStrip: {
    flexDirection: "row",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  flex1: { flex: 1 },
  rowMeta: { marginTop: 2 },
  rowRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { textAlign: "center" },
});
