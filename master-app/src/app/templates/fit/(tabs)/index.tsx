import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Card } from "glacia-native";

import { useFit } from "../state";
import { TODAYS_WORKOUT_ID, workoutById } from "../data";
import {
  Figure,
  ListCard,
  RingProgress,
  RowSeparator,
  SectionTitle,
  T,
  WeekBars,
  WorkoutTile,
} from "../ui";

const todayLabel = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function TodayScreen() {
  const fit = useFit();
  const plan = workoutById(TODAYS_WORKOUT_ID);
  const stepShare = fit.todaySteps / fit.stepGoal;
  const planDoneToday = fit.todaysSessions.some((s) => s.workoutId === plan.id);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header — the context is today, not a greeting */}
      <View style={styles.header}>
        <Avatar name={fit.userName} size="lg" isDark={fit.darkMode} />
        <View style={styles.flex1}>
          <T variant="caption" muted>
            {todayLabel}
          </T>
          <T variant="heading">{fit.userName}</T>
        </View>
        <Badge tone="muted" isDark={fit.darkMode}>
          {fit.streakDays} day streak
        </Badge>
      </View>

      {/* Today's activity */}
      <View>
        <SectionTitle>Today's activity</SectionTitle>
        <Card isDark={fit.darkMode} padding={20}>
          <View style={styles.activityRow}>
            <RingProgress value={stepShare}>
              <Figure variant="title">
                {fit.todaySteps.toLocaleString("en-US")}
              </Figure>
              <T variant="caption" muted>
                of {fit.stepGoal.toLocaleString("en-US")} steps
              </T>
            </RingProgress>
            <View style={styles.statsColumn}>
              <View>
                <Figure variant="title">{fit.todayCalories}</Figure>
                <T variant="caption" muted>
                  Calories burned
                </T>
              </View>
              <View>
                <Figure variant="title">{fit.todayActiveMin} min</Figure>
                <T variant="caption" muted>
                  Active minutes
                </T>
              </View>
              <View>
                <Figure variant="title">{Math.round(stepShare * 100)}%</Figure>
                <T variant="caption" muted>
                  Of today's step goal
                </T>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Today's workout */}
      <View>
        <SectionTitle>Today's workout</SectionTitle>
        <Card isDark={fit.darkMode} padding={20}>
          <View style={styles.planRow}>
            <WorkoutTile workout={plan} size={64} />
            <View style={styles.flex1}>
              <T variant="heading" numberOfLines={1}>
                {plan.name}
              </T>
              <T variant="caption" muted style={styles.planMeta}>
                {plan.category} · {plan.durationMin} min · {plan.exercises.length}{" "}
                exercises · {plan.calories} kcal
              </T>
            </View>
          </View>
          <T variant="body" muted style={styles.planBlurb}>
            {plan.blurb}
          </T>
          {planDoneToday ? (
            <View style={styles.doneRow}>
              <Badge tone="muted" isDark={fit.darkMode}>
                Completed today
              </Badge>
              <Button
                variant="ghost"
                accessibilityLabel="View today's workout details"
                onPress={() => router.push(`/templates/fit/workout/${plan.id}`)}
                isDark={fit.darkMode}
              >
                View details
              </Button>
            </View>
          ) : (
            <View style={styles.planActions}>
              <Button
                variant="filled"
                size="lg"
                accessibilityLabel={`Start ${plan.name}`}
                onPress={() => router.push(`/templates/fit/player/${plan.id}`)}
                isDark={fit.darkMode}
                style={styles.flex1}
              >
                Start workout
              </Button>
              <Button
                variant="glass"
                size="lg"
                accessibilityLabel="Preview today's workout"
                onPress={() => router.push(`/templates/fit/workout/${plan.id}`)}
                isDark={fit.darkMode}
              >
                Preview
              </Button>
            </View>
          )}
        </Card>
      </View>

      {/* This week */}
      <View>
        <SectionTitle>This week</SectionTitle>
        <ListCard>
          <View style={styles.weekHeader}>
            <T variant="body">Active minutes</T>
            <T variant="caption" muted>
              {fit.weekBars.reduce((s, b) => s + b.minutes, 0)} min total
            </T>
          </View>
          <View style={styles.weekBarsWrap}>
            <WeekBars bars={fit.weekBars} />
          </View>
        </ListCard>
      </View>

      {/* Sessions logged today */}
      {fit.todaysSessions.length > 0 ? (
        <View>
          <SectionTitle>Logged today</SectionTitle>
          <ListCard>
            {fit.todaysSessions.map((session, i) => (
              <View key={session.id}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.sessionRow}>
                  <View style={styles.flex1}>
                    <T variant="body">{session.workoutName}</T>
                    <T variant="caption" muted>
                      {session.setsDone} sets · {session.calories} kcal
                    </T>
                  </View>
                  <Figure variant="body">{session.durationMin} min</Figure>
                </View>
              </View>
            ))}
          </ListCard>
        </View>
      ) : null}

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex1: { flex: 1 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  statsColumn: {
    flex: 1,
    gap: 12,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planMeta: { marginTop: 4 },
  planBlurb: { marginTop: 16 },
  planActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  weekBarsWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
});
