import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Switch } from "glacia-native";

import { useFit } from "../state";
import { USER_IMAGE } from "../data";
import {
  BackdropControl,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  Stat,
  T,
} from "../ui";

export default function ProfileScreen() {
  const fit = useFit();

  return (
    <Screen belowTabBar title="Profile" subtitle="Your training, your settings">
      {/* Identity + lifetime stats — plain figures, no card */}
      <View>
        <View style={styles.identityRow}>
          <Avatar name={fit.userName} size="lg" isDark={fit.darkMode} source={USER_IMAGE} />
          <View style={styles.flex1}>
            <T variant="heading">{fit.userName}</T>
            <T variant="caption" muted>
              Member since 2023
            </T>
          </View>
        </View>
        <View style={styles.statsStrip}>
          <Stat value={`${fit.lifetimeWorkouts}`} label="Workouts" />
          <Stat value={fit.lifetimeHours.toFixed(1)} label="Hours trained" />
          <Stat
            value={fit.lifetimeCalories.toLocaleString("en-US")}
            label="Kcal burned"
          />
        </View>
      </View>

      {/* Shortcuts */}
      <View>
        <SectionTitle>Shortcuts</SectionTitle>
        <NavRow
          title="Weekly goal"
          description="Adjust how many workouts you aim for"
          detail={`${fit.weekWorkouts.length} / ${fit.weeklyGoal}`}
          onPress={() => router.push("/templates/fit/(tabs)/goals")}
        />
        <RowSeparator />
        <NavRow
          title="Workout history"
          description="Every session you've logged"
          detail={`${fit.history.length}`}
          onPress={() => router.push("/templates/fit/(tabs)/activity")}
        />
        <RowSeparator />
        <NavRow
          title="Browse workouts"
          description="Strength, cardio, HIIT and mobility"
          onPress={() => router.push("/templates/fit/(tabs)/workouts")}
        />
      </View>

      {/* Background */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <View style={styles.backdropBody}>
          <BackdropControl />
          <T variant="caption" muted style={styles.backdropNote}>
            Dark gray, broken white, or the palm photo — the glass sits over
            all three
          </T>
        </View>
      </View>

      {/* Settings */}
      <View>
        <SectionTitle>Settings</SectionTitle>
        <SettingRow
          title="Workout reminders"
          description="A nudge on days you haven't trained"
        >
          <Switch
            value={fit.notifications}
            onValueChange={fit.setNotifications}
            accessibilityLabel="Workout reminders"
            isDark={fit.darkMode}
          />
        </SettingRow>
        <RowSeparator />
        <SettingRow
          title="Weekly report"
          description="Email a summary every Monday"
        >
          <Switch
            value={fit.weeklyReport}
            onValueChange={fit.setWeeklyReport}
            accessibilityLabel="Weekly report email"
            isDark={fit.darkMode}
          />
        </SettingRow>
      </View>

      <T variant="caption" muted style={styles.sampleNote}>
        Sample data — stats, history and the streak are fixtures stored in
        memory for this session. Restarting the app resets them
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex1: { flex: 1 },
  statsStrip: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  backdropBody: {
    gap: 12,
  },
  backdropNote: { textAlign: "center" },
  sampleNote: {
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
