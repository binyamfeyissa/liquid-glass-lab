import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Field, Input, Select, Switch } from "glacia-native";

import { useStillwater } from "../state";
import { BEDTIME_OPTIONS, GOAL_OPTIONS } from "../data";
import {
  BackdropControl,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

export default function ProfileScreen() {
  const app = useStillwater();
  const [saved, setSaved] = useState(false);

  const edit = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setSaved(false);
  };

  return (
    <Screen title="Profile" subtitle="Name, goal, reminders and background">
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={app.userName || "Guest"} size="lg" isDark={app.darkMode} status="online" />
        <View style={styles.headerText}>
          <T variant="heading">{app.userName}</T>
          <T variant="body" muted>
            Stillwater member · {app.streakDays}-day streak
          </T>
        </View>
      </View>

      {/* Name + goal form */}
      <View>
        <SectionTitle>Practice</SectionTitle>
        <ListCard>
          <View style={styles.form}>
            <Field label="Your name" isDark={app.darkMode}>
              <Input
                value={app.userName}
                onChangeText={edit(app.setUserName)}
                placeholder="Your name"
                accessibilityLabel="Your name"
                isDark={app.darkMode}
              />
            </Field>
            <Field label="Daily goal" isDark={app.darkMode}>
              <Select
                value={String(app.goalMinutes)}
                onValueChange={(v) => {
                  app.setGoalMinutes(Number(v));
                  setSaved(false);
                }}
                options={GOAL_OPTIONS}
                accessibilityLabel="Daily goal in minutes"
                isDark={app.darkMode}
              />
            </Field>
            <Button
              accessibilityLabel="Save practice settings"
              variant="filled"
              disabled={!app.userName.trim()}
              onPress={() => setSaved(true)}
            >
              Save
            </Button>
            {saved ? (
              <Badge tone="muted" isDark={app.darkMode} style={styles.savedBadge}>
                Saved
              </Badge>
            ) : null}
          </View>
        </ListCard>
      </View>

      {/* Practice shortcuts */}
      <View>
        <SectionTitle>Shortcuts</SectionTitle>
        <ListCard>
          <NavRow
            title="Breathing exercises"
            description="4·4·6, Box and 4·7·8 patterns"
            onPress={() => router.push("/templates/calm/breathing")}
          />
          <RowSeparator />
          <NavRow
            title="Sleep sounds"
            description="Rain, ocean, forest and white noise"
            onPress={() => router.push("/templates/calm/(tabs)/sleep")}
          />
          <RowSeparator />
          <NavRow
            title="Your progress"
            description={`${app.todayMinutes} of ${app.goalMinutes} minutes today`}
            onPress={() => router.push("/templates/calm/(tabs)/progress")}
          />
        </ListCard>
      </View>

      {/* Reminders + notifications */}
      <View>
        <SectionTitle>Reminders</SectionTitle>
        <ListCard>
          <SettingRow
            title="Daily practice reminder"
            description="One gentle nudge, late morning"
          >
            <Switch
              value={app.dailyReminder}
              onValueChange={app.setDailyReminder}
              accessibilityLabel="Daily practice reminder"
              isDark={app.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Bedtime reminder"
            description={`Wind-down nudge at ${BEDTIME_OPTIONS.find((o) => o.value === app.bedtime)?.label ?? app.bedtime}`}
          >
            <Switch
              value={app.bedtimeReminder}
              onValueChange={app.setBedtimeReminder}
              accessibilityLabel="Bedtime reminder"
              isDark={app.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Weekly progress report"
            description="Your minutes and streak, every Sunday"
          >
            <Switch
              value={app.weeklyReport}
              onValueChange={app.setWeeklyReport}
              accessibilityLabel="Weekly progress report"
              isDark={app.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* Background */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBody}>
            <BackdropControl />
            <T variant="caption" muted style={styles.backdropNote}>
              Dark gray, broken white, or the Tahoe photo — the glass sits over all three
            </T>
          </View>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Stillwater · simulated playback, nothing leaves the device
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: { flex: 1, gap: 4 },
  form: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  backdropBody: { padding: 16, gap: 12 },
  backdropNote: { marginTop: 4 },
  savedBadge: { alignSelf: "flex-start" },
  foot: { textAlign: "center" },
});
