import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Card, Chip, Progress, Stepper, Switch } from "glacia-native";

import { useHealth } from "../state";
import { MOOD_LABELS, todayKey } from "../data";
import {
  accentColor,
  chromeColors,
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "../ui";

function pct(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}

function MetricCard({
  label,
  headline,
  sub,
  progress,
  children,
}: {
  label: string;
  headline: string;
  sub: string;
  progress: number;
  children?: React.ReactNode;
}) {
  const app = useHealth();
  return (
    <Card isDark={app.darkMode} padding={16} style={styles.metricCard}>
      <T variant="label" muted>
        {label}
      </T>
      <Figure variant="title" style={styles.metricValue}>
        {headline}
      </Figure>
      <T variant="caption" muted>
        {sub}
      </T>
      <Progress
        value={progress}
        tint={accentColor(app.backdrop)}
        accessibilityLabel={`${label} progress`}
        isDark={app.darkMode}
        style={styles.metricBar}
      />
      {children}
    </Card>
  );
}

export default function TodayScreen() {
  const app = useHealth();
  const chrome = chromeColors(app.backdrop);
  const today = todayKey();

  const steps = app.dayTotal("steps", today);
  const water = app.dayTotal("water", today);
  const sleep = app.dayLatest("sleep", today);
  const mood = app.dayLatest("mood", today);
  const weight = app.latestWeight();
  const weightEntries = app.entries.filter((e) => e.metric === "weight");
  const weightDelta =
    weight !== undefined && weightEntries.length >= 2
      ? weight - weightEntries[0].value
      : undefined;

  const habitsDone = app.habits.filter((h) => app.checkedOn(h.id, today)).length;

  return (
    <Screen
      title="Today"
      subtitle="Today's log — sample data, typed in by hand"
    >
      {/* Quick actions */}
      <View style={styles.actions}>
        <Button
          isDark={app.darkMode}
          accessibilityLabel="Open the log screen"
          variant="filled"
          onPress={() => router.push("/templates/health/log")}
          style={styles.actionBtn}
        >
          Log entry
        </Button>
        <Button
          isDark={app.darkMode}
          accessibilityLabel="Open history"
          variant="ghost"
          onPress={() => router.push("/templates/health/history")}
          style={styles.actionBtn}
        >
          History
        </Button>
      </View>

      {/* Steps + water */}
      <View style={styles.cardRow}>
        <MetricCard
          label="Steps"
          headline={steps.toLocaleString("en-US")}
          sub={`of ${app.goals.steps.toLocaleString("en-US")} goal`}
          progress={pct(steps, app.goals.steps)}
        >
          <View style={styles.quickAdds}>
            {[250, 500, 1000].map((n) => (
              <Chip
                key={n}
                label={`+${n}`}
                onPress={() => app.addEntry("steps", n)}
                isDark={app.darkMode}
              />
            ))}
          </View>
        </MetricCard>

        <MetricCard
          label="Water"
          headline={`${water}`}
          sub={`glasses · of ${app.goals.water} goal`}
          progress={pct(water, app.goals.water)}
        >
          <View style={styles.stepperRow}>
            <Stepper
              value={water}
              min={0}
              onValueChange={(v) => app.setDayTotal("water", today, v)}
              accessibilityLabel="Glasses of water"
              isDark={app.darkMode}
            />
          </View>
        </MetricCard>
      </View>

      {/* Sleep + weight */}
      <View style={styles.cardRow}>
        <MetricCard
          label="Sleep"
          headline={sleep !== undefined ? `${sleep} h` : "—"}
          sub={
            sleep !== undefined
              ? `last night · goal ${app.goals.sleep} h`
              : "not logged yet"
          }
          progress={pct(sleep ?? 0, app.goals.sleep)}
        />
        <MetricCard
          label="Weight"
          headline={weight !== undefined ? `${weight.toFixed(1)} kg` : "—"}
          sub={
            weightDelta !== undefined
              ? `${weightDelta <= 0 ? "−" : "+"}${Math.abs(weightDelta).toFixed(1)} kg · target ${app.goals.weight} kg`
              : `target ${app.goals.weight} kg`
          }
          progress={
            weight !== undefined
              ? pct(Math.max(0, app.goals.weight + 5 - weight), 5)
              : 0
          }
        />
      </View>

      {/* Mood */}
      <View>
        <SectionTitle>Mood</SectionTitle>
        <ListCard>
          <View style={styles.moodRow}>
            <View style={styles.flex1}>
              <T variant="body">
                {mood !== undefined
                  ? `Feeling ${MOOD_LABELS[mood].toLowerCase()} today`
                  : "How are you feeling"}
              </T>
              <T variant="caption" muted style={styles.moodSub}>
                {mood !== undefined
                  ? "Logged for today — tap Log entry to change it"
                  : "Not logged yet today"}
              </T>
            </View>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Log mood"
              variant="ghost"
              onPress={() => router.push("/templates/health/log")}
            >
              {mood !== undefined ? "Change" : "Log"}
            </Button>
          </View>
        </ListCard>
      </View>

      {/* Habits preview */}
      <View>
        <SectionTitle>Today's habits</SectionTitle>
        <ListCard>
          {app.habits.map((habit, i) => (
            <React.Fragment key={habit.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.habitRow}>
                <View style={styles.flex1}>
                  <T variant="body">{habit.name}</T>
                  <T variant="caption" muted style={styles.moodSub}>
                    {app.streakOf(habit.id)} day streak · {habit.weeklyTarget}× a week
                  </T>
                </View>
                {app.checkedOn(habit.id, today) ? (
                  <Badge tone="muted" isDark={app.darkMode}>
                    Done
                  </Badge>
                ) : null}
                <Switch
                  value={app.checkedOn(habit.id, today)}
                  onValueChange={() => app.toggleCheck(habit.id, today)}
                  accessibilityLabel={`Mark ${habit.name} done today`}
                  isDark={app.darkMode}
                />
              </View>
            </React.Fragment>
          ))}
        </ListCard>
        <T variant="caption" muted style={styles.habitsNote}>
          {habitsDone} of {app.habits.length} done today · see the Habits tab for
          the full week
        </T>
      </View>

      {/* Profile strip */}
      <View style={styles.profileStrip}>
        <Avatar name={app.userName} size="md" isDark={app.darkMode} />
        <View style={styles.flex1}>
          <T variant="body">{app.userName}</T>
          <T variant="caption" muted>
            Tracking since November · sample data only
          </T>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: { flex: 1 },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: { flex: 1 },
  metricValue: {
    marginTop: 12,
    marginBottom: 4,
  },
  metricBar: { marginTop: 12 },
  quickAdds: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  quickAdd: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  stepperRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  moodSub: { marginTop: 2 },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  habitsNote: {
    marginTop: 8,
    marginLeft: 4,
  },
  profileStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
});
