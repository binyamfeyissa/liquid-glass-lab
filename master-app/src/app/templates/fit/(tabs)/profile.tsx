import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Card, Switch } from "glacia-native";

import { useFit } from "../state";
import {
  BackdropControl,
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

export default function ProfileScreen() {
  const fit = useFit();

  return (
    <Screen title="Profile" subtitle="Your training, your settings">
      {/* Identity + lifetime stats */}
      <Card isDark={fit.darkMode} padding={20}>
        <View style={styles.identityRow}>
          <Avatar name={fit.userName} size="lg" isDark={fit.darkMode} />
          <View style={styles.flex1}>
            <T variant="heading">{fit.userName}</T>
            <T variant="caption" muted>
              Member since 2023
            </T>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Figure variant="title">{fit.lifetimeWorkouts}</Figure>
            <T variant="caption" muted>
              Workouts
            </T>
          </View>
          <View style={styles.stat}>
            <Figure variant="title">{fit.lifetimeHours.toFixed(1)}</Figure>
            <T variant="caption" muted>
              Hours trained
            </T>
          </View>
          <View style={styles.stat}>
            <Figure variant="title">
              {fit.lifetimeCalories.toLocaleString("en-US")}
            </Figure>
            <T variant="caption" muted>
              Kcal burned
            </T>
          </View>
        </View>
      </Card>

      {/* Shortcuts */}
      <View>
        <SectionTitle>Shortcuts</SectionTitle>
        <ListCard>
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
        </ListCard>
      </View>

      {/* Background */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBody}>
            <BackdropControl />
            <T variant="caption" muted style={styles.backdropNote}>
              Dark gray, broken white, or the palm photo — the glass sits over
              all three
            </T>
          </View>
        </ListCard>
      </View>

      {/* Settings */}
      <View>
        <SectionTitle>Settings</SectionTitle>
        <ListCard>
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
        </ListCard>
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
  backdropBody: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  backdropNote: { textAlign: "center" },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  sampleNote: {
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
