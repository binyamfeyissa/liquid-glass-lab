import React from "react";
import { StyleSheet, View } from "react-native";
import { Progress, Stepper } from "glacia-native";

import { useFit } from "../state";
import {
  Figure,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
  WeekBars,
  accentColor,
  neutralTint,
} from "../ui";

const MINUTES_GOAL = 150;

export default function GoalsScreen() {
  const fit = useFit();
  const done = fit.weekWorkouts.length;
  const goalShare = Math.min(100, (done / fit.weeklyGoal) * 100);
  const minutesShare = Math.min(100, (fit.weekMinutes / MINUTES_GOAL) * 100);
  const remaining = Math.max(0, fit.weeklyGoal - done);

  return (
    <Screen belowTabBar title="Goals" subtitle="Targets for this week">
      {/* Weekly workout goal — the count is the moment, the bar follows */}
      <View>
        <SectionTitle>Weekly workouts</SectionTitle>
        <Figure variant="title" style={styles.goalFigure}>
          {done} of {fit.weeklyGoal}
        </Figure>
        {remaining === 0 ? (
          <T
            variant="caption"
            style={[styles.meta, { color: accentColor(fit.darkMode) }]}
          >
            Goal reached
          </T>
        ) : (
          <T variant="caption" muted style={styles.meta}>
            {remaining} more to reach this week's target
          </T>
        )}
        <Progress
          value={goalShare}
          tint={accentColor(fit.darkMode)}
          accessibilityLabel={`Weekly workout goal, ${done} of ${fit.weeklyGoal}`}
          isDark={fit.darkMode}
          style={styles.progress}
        />
        <View style={styles.stepperRow}>
          <T variant="body">Weekly target</T>
          <Stepper
            value={fit.weeklyGoal}
            onValueChange={fit.setWeeklyGoal}
            min={1}
            max={10}
            accessibilityLabel="Weekly workout target"
            isDark={fit.darkMode}
            formatValue={(v) => `${v} / wk`}
          />
        </View>
      </View>

      {/* Streak — one big accent number, the week underneath */}
      <View>
        <SectionTitle>Streak</SectionTitle>
        <View style={styles.streakRow}>
          <Figure
            variant="title"
            style={{
              ...styles.streakFigure,
              color: accentColor(fit.darkMode),
            }}
          >
            {fit.streakDays}
          </Figure>
          <View style={styles.flex1}>
            <T variant="heading">Day streak</T>
            <T variant="caption" muted style={styles.meta}>
              One session today keeps the streak alive
            </T>
          </View>
        </View>
        <View style={styles.weekBarsWrap}>
          <WeekBars bars={fit.weekBars} height={64} />
        </View>
      </View>

      {/* More weekly targets — quiet rows, neutral bars; the accent stays
          reserved for the one main goal above */}
      <View>
        <SectionTitle>More targets</SectionTitle>
        <View style={styles.targetBlock}>
          <SettingRow
            title="Active minutes"
            description={`${fit.weekMinutes} of ${MINUTES_GOAL} min this week`}
          >
            <Figure variant="body">{Math.round(minutesShare)}%</Figure>
          </SettingRow>
          <Progress
            value={minutesShare}
            tint={neutralTint(fit.darkMode)}
            accessibilityLabel="Weekly active minutes goal"
            isDark={fit.darkMode}
            style={styles.targetProgress}
          />
        </View>
        <RowSeparator />
        <View style={styles.targetBlock}>
          <SettingRow
            title="Calories burned"
            description={`${fit.weekCalories.toLocaleString("en-US")} of 1,800 kcal this week`}
          >
            <Figure variant="body">
              {Math.min(100, Math.round((fit.weekCalories / 1800) * 100))}%
            </Figure>
          </SettingRow>
          <Progress
            value={Math.min(100, (fit.weekCalories / 1800) * 100)}
            tint={neutralTint(fit.darkMode)}
            accessibilityLabel="Weekly calories goal"
            isDark={fit.darkMode}
            style={styles.targetProgress}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  meta: { marginTop: 4 },
  goalFigure: {
    fontSize: 34,
    lineHeight: 38,
  },
  progress: { marginTop: 16 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakFigure: {
    fontSize: 44,
    lineHeight: 48,
    minWidth: 52,
    textAlign: "center",
  },
  weekBarsWrap: { marginTop: 16 },
  targetBlock: {
    paddingBottom: 16,
  },
  targetProgress: {
    marginTop: 4,
  },
});
