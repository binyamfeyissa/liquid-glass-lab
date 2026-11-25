import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, SegmentedControl } from "glacia-native";

import { useFit } from "../state";
import { workoutById, type HistoryEntry } from "../data";
import { Figure, ListCard, RowSeparator, Screen, T, WorkoutTile } from "../ui";

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const fit = useFit();
  const workout = workoutById(entry.workoutId);
  return (
    <View style={styles.row}>
      <WorkoutTile workout={workout} size={46} />
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
        <Badge tone="muted" isDark={fit.darkMode} style={styles.rowBadge}>
          {entry.category}
        </Badge>
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
    <Screen
      title="Activity"
      subtitle={
        range === 0
          ? `${entries.length} workouts · ${totalMin} min · ${totalCal} kcal this week`
          : `${entries.length} workouts · ${totalMin} min · ${totalCal} kcal in this log`
      }
    >
      <SegmentedControl
        segments={["This week", "All logged"]}
        selectedIndex={range}
        onChange={setRange}
        accessibilityLabel="History range"
        isDark={fit.darkMode}
      />

      {entries.length === 0 ? (
        <ListCard>
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
        </ListCard>
      ) : (
        <ListCard>
          {entries.map((entry, i) => (
            <View key={entry.id}>
              {i > 0 ? <RowSeparator /> : null}
              <HistoryRow entry={entry} />
            </View>
          ))}
        </ListCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  flex1: { flex: 1 },
  rowMeta: { marginTop: 2 },
  rowRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  rowBadge: { alignSelf: "flex-end" },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { textAlign: "center" },
});
