import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Badge, Button, Input, Stepper, Switch } from "glacia-native";

import { useHealth } from "../state";
import { dateKey, todayKey, weekdayLetter } from "../data";
import {
  chromeColors,
  Field,
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "../ui";

function HabitCard({ habitId }: { habitId: string }) {
  const app = useHealth();
  const chrome = chromeColors(app.backdrop);
  const habit = app.habits.find((h) => h.id === habitId)!;
  const today = todayKey();
  const streak = app.streakOf(habit.id);
  const weekKeys = [6, 5, 4, 3, 2, 1, 0].map((ago) => dateKey(ago));
  const weekCount = weekKeys.filter((k) => app.checkedOn(habit.id, k)).length;

  return (
    <ListCard>
      <View style={styles.habitHead}>
        <View style={styles.flex1}>
          <T variant="body">{habit.name}</T>
          <T variant="caption" muted style={styles.sub}>
            {weekCount} of {habit.weeklyTarget} this week
            {streak > 0 ? ` · ${streak} day streak` : ""}
          </T>
        </View>
        {app.checkedOn(habit.id, today) ? (
          <Badge tone="muted" isDark={app.darkMode}>
            Done today
          </Badge>
        ) : null}
        <Switch
          value={app.checkedOn(habit.id, today)}
          onValueChange={() => app.toggleCheck(habit.id, today)}
          accessibilityLabel={`Mark ${habit.name} done today`}
          isDark={app.darkMode}
        />
      </View>
      <View style={styles.dotsRow}>
        {weekKeys.map((key) => {
          const on = app.checkedOn(habit.id, key);
          const isToday = key === today;
          return (
            <Pressable
              key={key}
              onPress={() => app.toggleCheck(habit.id, key)}
              accessibilityRole="button"
              accessibilityLabel={`${habit.name} on ${key}${on ? ", checked" : ""}`}
              style={styles.dotCell}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: chrome.fill },
                  on && { backgroundColor: chrome.accent },
                  isToday && { borderColor: chrome.accent, borderWidth: 1.5 },
                ]}
              />
              <Figure variant="caption" muted style={styles.dotLabel}>
                {weekdayLetter(key)}
              </Figure>
            </Pressable>
          );
        })}
      </View>
    </ListCard>
  );
}

export default function HabitsScreen() {
  const app = useHealth();
  const chrome = chromeColors(app.backdrop);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(3);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  function addHabit() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Give the habit a name of at least 2 characters.");
      setAdded(false);
      return;
    }
    if (app.habits.some((h) => h.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("You already track a habit with that name.");
      setAdded(false);
      return;
    }
    app.addHabit(trimmed, target);
    setName("");
    setTarget(3);
    setError("");
    setAdded(true);
  }

  return (
    <Screen
      title="Habits"
      subtitle="Checked off day by day — streaks from your check history"
    >
      {app.habits.map((habit) => (
        <View key={habit.id}>
          <SectionTitle>{habit.name}</SectionTitle>
          <HabitCard habitId={habit.id} />
        </View>
      ))}

      <View>
        <SectionTitle>New habit</SectionTitle>
        <ListCard>
          <Field label="Habit name">
            <Input
              value={name}
              onChangeText={(t) => {
                setName(t);
                setAdded(false);
              }}
              placeholder="e.g. Stretch for 5 minutes"
              accessibilityLabel="New habit name"
              isDark={app.darkMode}
            />
          </Field>
          <RowSeparator />
          <View style={styles.targetRow}>
            <View style={styles.flex1}>
              <T variant="body">Weekly target</T>
              <T variant="caption" muted style={styles.sub}>
                Days per week you aim to do it
              </T>
            </View>
            <Stepper
              value={target}
              onValueChange={setTarget}
              min={1}
              max={7}
              accessibilityLabel="Weekly target in days"
              isDark={app.darkMode}
            />
          </View>
          {error ? (
            <T variant="caption" style={[styles.error, { color: chrome.neg }]}>
              {error}
            </T>
          ) : null}
          {added ? (
            <T variant="caption" style={[styles.saved, { color: chrome.pos }]}>
              Habit added — it is at the bottom of the list above
            </T>
          ) : null}
          <View style={styles.cardBtn}>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Add habit"
              variant="filled"
              onPress={addHabit}
            >
              Add habit
            </Button>
          </View>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  sub: { marginTop: 2 },
  habitHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dotsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  dotCell: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  dotLabel: { fontSize: 11 },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  error: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  saved: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cardBtn: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
});
