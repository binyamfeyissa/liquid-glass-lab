import React from "react";
import { StyleSheet, View } from "react-native";
import { Badge, Card, Progress, Stepper } from "glacia-native";

import { useFit } from "../state";
import {
  Figure,
  ListCard,
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
      {/* Weekly workout goal */}
      <View>
        <SectionTitle>Weekly workouts</SectionTitle>
        <Card isDark={fit.darkMode} padding={20}>
          <View style={styles.dualRow}>
            <View style={styles.flex1}>
              <Figure variant="title">
                {done} of {fit.weeklyGoal}
              </Figure>
              <T variant="caption" muted style={styles.meta}>
                {remaining === 0
                  ? "Goal reached"
                  : `${remaining} more to reach this week's target`}
              </T>
            </View>
            <Badge tone="muted" isDark={fit.darkMode}>
              {remaining === 0 ? "Done" : "In progress"}
            </Badge>
          </View>
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
        </Card>
      </View>

      {/* Streak */}
      <View>
        <SectionTitle>Streak</SectionTitle>
        <Card isDark={fit.darkMode} padding={20}>
          <View style={styles.dualRow}>
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
        </Card>
      </View>

      {/* More weekly targets */}
      <View>
        <SectionTitle>More targets</SectionTitle>
        <ListCard>
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
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex1: { flex: 1 },
  meta: { marginTop: 4 },
  progress: { marginTop: 16 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
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
    marginHorizontal: 16,
  },
});
