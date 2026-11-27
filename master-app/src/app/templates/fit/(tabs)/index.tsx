import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button } from "glacia-native";

import { useFit } from "../state";
import { TODAYS_WORKOUT_ID, USER_IMAGE, workoutById } from "../data";
import {
  Figure,
  RingProgress,
  RowSeparator,
  SectionTitle,
  Stat,
  T,
  WeekBars,
  WorkoutPhoto,
  accentColor,
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
        <Avatar name={fit.userName} size="lg" isDark={fit.darkMode} source={USER_IMAGE} />
        <View style={styles.flex1}>
          <T variant="caption" muted>
            {todayLabel}
          </T>
          <T variant="heading">{fit.userName}</T>
        </View>
        <View style={styles.streakStat}>
          <Figure variant="title">{fit.streakDays}</Figure>
          <T variant="caption" muted>
            day streak
          </T>
        </View>
      </View>

      {/* Today's activity — the ring is the hero, the stats are plain figures */}
      <View>
        <SectionTitle>Today's activity</SectionTitle>
        <View style={styles.ringWrap}>
          <RingProgress value={stepShare} size={168} strokeWidth={12}>
            <Figure variant="title" style={styles.stepsFigure}>
              {fit.todaySteps.toLocaleString("en-US")}
            </Figure>
            <T variant="caption" muted>
              of {fit.stepGoal.toLocaleString("en-US")} steps
            </T>
          </RingProgress>
        </View>
        <View style={styles.statsStrip}>
          <Stat value={`${fit.todayCalories}`} label="Calories" variant="title" />
          <Stat value={`${fit.todayActiveMin}`} label="Active min" variant="title" />
          <Stat value={`${fit.todaysSessions.length}`} label="Workouts today" variant="title" />
        </View>
      </View>

      {/* Today's workout — the photo leads, type does the rest */}
      <View>
        <SectionTitle>Today's workout</SectionTitle>
        <WorkoutPhoto workout={plan} />
        <T variant="heading" numberOfLines={1} style={styles.planName}>
          {plan.name}
        </T>
        <T variant="caption" muted style={styles.planMeta}>
          {plan.category} · {plan.durationMin} min · {plan.exercises.length}{" "}
          exercises · {plan.calories} kcal
        </T>
        <T variant="body" muted style={styles.planBlurb}>
          {plan.blurb}
        </T>
        {planDoneToday ? (
          <View style={styles.planActions}>
            <T variant="body" style={[styles.doneLine, { color: accentColor(fit.darkMode) }]}>
              Completed today
            </T>
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
              tint={accentColor(fit.darkMode)}
              accessibilityLabel={`Start ${plan.name}`}
              onPress={() => router.push(`/templates/fit/player/${plan.id}`)}
              isDark={fit.darkMode}
              style={styles.fullWidth}
            >
              Start workout
            </Button>
            <Button
              variant="ghost"
              accessibilityLabel="Preview today's workout"
              onPress={() => router.push(`/templates/fit/workout/${plan.id}`)}
              isDark={fit.darkMode}
            >
              Preview
            </Button>
          </View>
        )}
      </View>

      {/* This week */}
      <View>
        <SectionTitle>This week</SectionTitle>
        <View style={styles.weekHeader}>
          <T variant="body">Active minutes</T>
          <T variant="caption" muted>
            {fit.weekBars.reduce((s, b) => s + b.minutes, 0)} min total
          </T>
        </View>
        <View style={styles.weekBarsWrap}>
          <WeekBars bars={fit.weekBars} height={96} />
        </View>
      </View>

      {/* Sessions logged today */}
      {fit.todaysSessions.length > 0 ? (
        <View>
          <SectionTitle>Logged today</SectionTitle>
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
        </View>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 128,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex1: { flex: 1 },
  streakStat: {
    alignItems: "flex-end",
    gap: 2,
  },
  ringWrap: {
    alignItems: "center",
    paddingTop: 8,
  },
  stepsFigure: {
    fontSize: 34,
    lineHeight: 38,
  },
  statsStrip: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  planName: { marginTop: 12 },
  planMeta: { marginTop: 4 },
  planBlurb: { marginTop: 8 },
  planActions: {
    gap: 4,
    marginTop: 16,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  doneLine: {
    textAlign: "center",
    fontWeight: "600",
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  weekBarsWrap: {
    marginTop: 12,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
});
