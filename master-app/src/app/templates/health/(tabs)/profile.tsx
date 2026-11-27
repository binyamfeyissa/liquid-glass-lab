import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Input,
  Select,
  Stepper,
  Switch,
} from "glacia-native";

import { useHealth } from "../state";
import { USER_IMAGE } from "../data";
import {
  BackdropControl,
  chromeColors,
  Field,
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

const STEPS_GOAL_OPTIONS = [4000, 6000, 8000, 10000, 12000, 15000].map(
  (n) => ({ value: String(n), label: `${n.toLocaleString("en-US")} steps` }),
);
const SLEEP_GOAL_OPTIONS = [6, 7, 7.5, 8, 8.5, 9].map((n) => ({
  value: String(n),
  label: `${n} hours`,
}));

export default function ProfileScreen() {
  const app = useHealth();
  const chrome = chromeColors(app.backdrop);

  const [nameDraft, setNameDraft] = useState(app.userName);
  const [heightDraft, setHeightDraft] = useState(String(app.heightCm));
  const [formError, setFormError] = useState("");
  const [formSaved, setFormSaved] = useState(false);

  const weight = app.latestWeight();
  const bmi =
    weight !== undefined && app.heightCm > 0
      ? weight / Math.pow(app.heightCm / 100, 2)
      : undefined;

  function saveProfile() {
    const name = nameDraft.trim();
    const height = Number(heightDraft);
    if (name.length < 2) {
      setFormError("Your name needs at least 2 characters.");
      setFormSaved(false);
      return;
    }
    if (Number.isNaN(height) || height < 100 || height > 250) {
      setFormError("Height must be between 100 and 250 cm.");
      setFormSaved(false);
      return;
    }
    app.setUserName(name);
    app.setHeightCm(Math.round(height));
    setFormError("");
    setFormSaved(true);
  }

  return (
    <Screen belowTabBar title="Profile" subtitle="Your details, goals and app settings">
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={app.userName} size="lg" isDark={app.darkMode} source={USER_IMAGE} />
        <View style={styles.flex1}>
          <T variant="heading">{app.userName}</T>
          <T variant="body" muted>
            {app.entries.length} entries logged · sample data
          </T>
        </View>
      </View>

      {/* Details form */}
      <View>
        <SectionTitle>Details</SectionTitle>
        <ListCard>
          <Field label="Name">
            <Input
              value={nameDraft}
              onChangeText={(t) => {
                setNameDraft(t);
                setFormSaved(false);
              }}
              placeholder="Your name"
              accessibilityLabel="Your name"
              isDark={app.darkMode}
            />
          </Field>
          <Field label="Height (cm)">
            <Input
              value={heightDraft}
              onChangeText={(t) => {
                setHeightDraft(t);
                setFormSaved(false);
              }}
              placeholder="e.g. 172"
              keyboardType="numeric"
              accessibilityLabel="Height in centimetres"
              isDark={app.darkMode}
            />
          </Field>
          {formError ? (
            <T variant="caption" style={[styles.error, { color: chrome.neg }]}>
              {formError}
            </T>
          ) : null}
          {formSaved ? (
            <T variant="caption" style={[styles.saved, { color: chrome.pos }]}>
              Saved
            </T>
          ) : null}
          <View style={styles.cardBtn}>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Save profile"
              variant="filled"
              onPress={saveProfile}
            >
              Save details
            </Button>
          </View>
        </ListCard>
      </View>

      {/* BMI — a plain number with the standard scale, no advice. */}
      <View>
        <SectionTitle>Body mass index</SectionTitle>
        <Card isDark={app.darkMode} padding={20}>
          <Figure variant="title">
            {bmi !== undefined ? bmi.toFixed(1) : "—"}
          </Figure>
          <T variant="body" muted style={styles.bmiNote}>
            {weight !== undefined
              ? `From your latest logged weight (${weight.toFixed(1)} kg) and height (${app.heightCm} cm). The standard BMI scale runs: under 18.5 low, 18.5–24.9 middle, 25–29.9 high, 30 and over higher. Shown for tracking reference only — it is a simple ratio, not a health assessment.`
              : "Log a weight entry and your BMI will appear here."}
          </T>
        </Card>
      </View>

      {/* Goals */}
      <View>
        <SectionTitle>Daily goals</SectionTitle>
        <ListCard>
          <Field label="Steps goal">
            <Select
              value={String(app.goals.steps)}
              onValueChange={(v) =>
                app.setGoals({ ...app.goals, steps: Number(v) })
              }
              options={STEPS_GOAL_OPTIONS}
              accessibilityLabel="Daily steps goal"
              isDark={app.darkMode}
            />
          </Field>
          <RowSeparator />
          <View style={styles.goalRow}>
            <View style={styles.flex1}>
              <T variant="body">Water goal</T>
              <T variant="caption" muted style={styles.sub}>
                Glasses per day
              </T>
            </View>
            <Stepper
              value={app.goals.water}
              onValueChange={(v) => app.setGoals({ ...app.goals, water: v })}
              min={1}
              max={16}
              accessibilityLabel="Daily water goal in glasses"
              isDark={app.darkMode}
            />
          </View>
          <RowSeparator />
          <Field label="Sleep goal">
            <Select
              value={String(app.goals.sleep)}
              onValueChange={(v) =>
                app.setGoals({ ...app.goals, sleep: Number(v) })
              }
              options={SLEEP_GOAL_OPTIONS}
              accessibilityLabel="Nightly sleep goal"
              isDark={app.darkMode}
            />
          </Field>
          <RowSeparator />
          <View style={styles.goalRow}>
            <View style={styles.flex1}>
              <T variant="body">Weight target</T>
              <T variant="caption" muted style={styles.sub}>
                Kilograms
              </T>
            </View>
            <Stepper
              value={app.goals.weight}
              onValueChange={(v) => app.setGoals({ ...app.goals, weight: v })}
              min={40}
              max={150}
              step={0.5}
              accessibilityLabel="Weight target in kilograms"
              isDark={app.darkMode}
            />
          </View>
          <T variant="caption" muted style={styles.goalsNote}>
            Goals update the progress bars on the Today tab straight away.
          </T>
        </ListCard>
      </View>

      {/* Shortcuts */}
      <View>
        <SectionTitle>Your log</SectionTitle>
        <ListCard>
          <NavRow
            title="Log an entry"
            description="Weight, steps, water, sleep, mood"
            onPress={() => router.push("/templates/health/log")}
          />
          <RowSeparator />
          <NavRow
            title="History"
            description="Every entry, grouped by day"
            detail={`${app.entries.length}`}
            onPress={() => router.push("/templates/health/history")}
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
              Dark gray, broken white, or the palm photo — the glass sits over all three
            </T>
          </View>
        </ListCard>
      </View>

      {/* App settings */}
      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <SettingRow
            title="Morning check-in reminder"
            description="A nudge to log last night's sleep"
          >
            <Switch
              value={app.reminders.morning}
              onValueChange={(v) =>
                app.setReminders({ ...app.reminders, morning: v })
              }
              accessibilityLabel="Morning check-in reminder"
              isDark={app.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Evening recap reminder"
            description="A nudge to finish today's log"
          >
            <Switch
              value={app.reminders.evening}
              onValueChange={(v) =>
                app.setReminders({ ...app.reminders, evening: v })
              }
              accessibilityLabel="Evening recap reminder"
              isDark={app.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Weekly summary"
            description="Your trends, every Sunday"
          >
            <Switch
              value={app.reminders.weekly}
              onValueChange={(v) =>
                app.setReminders({ ...app.reminders, weekly: v })
              }
              accessibilityLabel="Weekly summary"
              isDark={app.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* Sample-data note */}
      <Card isDark={app.darkMode} padding={20}>
        <T variant="body">Sample data</T>
        <T variant="caption" muted style={styles.bmiNote}>
          Vitalis is a template demo. Every number in this app is sample data
          typed in by hand on the Log screen — nothing is read from your
          device, its sensors or any health service, and nothing leaves the
          app. Entries live in memory only and reset when the app restarts.
        </T>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  sub: { marginTop: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 4,
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
  backdropBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backdropNote: {
    lineHeight: 18,
  },
  bmiNote: { marginTop: 8, lineHeight: 18 },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  goalsNote: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
