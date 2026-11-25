import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Card, Select, Switch } from "glacia-native";

import { useLearn } from "../state";
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
  formatMinutes,
} from "../ui";

const GOAL_OPTIONS = [
  { value: "10", label: "10 minutes a day" },
  { value: "20", label: "20 minutes a day" },
  { value: "30", label: "30 minutes a day" },
  { value: "45", label: "45 minutes a day" },
  { value: "60", label: "1 hour a day" },
];

export default function ProfileScreen() {
  const learn = useLearn();

  return (
    <Screen title="Profile" subtitle="Your learner stats and Glasshouse settings">
      {/* Learner header */}
      <View style={styles.header}>
        <Avatar name={learn.userName} size="lg" isDark={learn.darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">{learn.userName}</T>
          <T variant="caption" muted>
            <Figure variant="caption" muted>
              {learn.streakDays}
            </Figure>
            -day streak · learning since November
          </T>
        </View>
      </View>

      {/* Stats — all computed from the store */}
      <View>
        <SectionTitle>Your stats</SectionTitle>
        <Card isDark={learn.darkMode} padding={20}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Figure variant="title">{learn.lessonsCompleted}</Figure>
              <T variant="caption" muted>
                lessons completed
              </T>
            </View>
            <View style={styles.stat}>
              <Figure variant="title">{formatMinutes(learn.minutesLearned)}</Figure>
              <T variant="caption" muted>
                minutes learned
              </T>
            </View>
          </View>
          <View style={[styles.statRow, styles.statRowSpaced]}>
            <View style={styles.stat}>
              <Figure variant="title">{learn.coursesCompleted}</Figure>
              <T variant="caption" muted>
                courses completed
              </T>
            </View>
            <View style={styles.stat}>
              <Figure variant="title">{learn.enrolledCourses.length}</Figure>
              <T variant="caption" muted>
                courses enrolled
              </T>
            </View>
          </View>
          <T variant="caption" muted style={styles.statNote}>
            Minutes are estimated from the durations of the lessons you have
            completed — finish a lesson and they update everywhere
          </T>
        </Card>
      </View>

      {/* Learning preferences */}
      <View>
        <SectionTitle>Learning</SectionTitle>
        <ListCard>
          <View style={styles.goalBlock}>
            <T variant="body">Daily goal</T>
            <T variant="caption" muted style={styles.goalHint}>
              How long you aim to study each day
            </T>
            <Select
              value={learn.dailyGoal}
              onValueChange={learn.setDailyGoal}
              options={GOAL_OPTIONS}
              accessibilityLabel="Daily learning goal"
              isDark={learn.darkMode}
              style={styles.goalSelect}
            />
          </View>
          <RowSeparator />
          <NavRow
            title="My certificates"
            description="Courses finished and quizzes passed"
            detail={`${learn.coursesCompleted + Object.values(learn.quizResults).filter((q) => q.passed).length}`}
            onPress={() => router.push("/templates/learn/(tabs)/learning")}
          />
        </ListCard>
      </View>

      {/* Appearance + notifications */}
      <View>
        <SectionTitle>Preferences</SectionTitle>
        <ListCard>
          <View style={styles.bgBlock}>
            <T variant="body">Background</T>
            <T variant="caption" muted style={styles.goalHint}>
              Graphite, broken white, or the Tahoe photo
            </T>
            <View style={styles.bgControl}>
              <BackdropControl />
            </View>
          </View>
          <RowSeparator />
          <SettingRow
            title="Lesson reminders"
            description="A nudge when you have not studied today"
          >
            <Switch
              value={learn.lessonReminders}
              onValueChange={learn.setLessonReminders}
              accessibilityLabel="Lesson reminders"
              isDark={learn.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="New course alerts"
            description="When an instructor you follow publishes"
          >
            <Switch
              value={learn.newCourseAlerts}
              onValueChange={learn.setNewCourseAlerts}
              accessibilityLabel="New course alerts"
              isDark={learn.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Weekly digest"
            description="Your progress, every Monday morning"
          >
            <Switch
              value={learn.weeklyDigest}
              onValueChange={learn.setWeeklyDigest}
              accessibilityLabel="Weekly digest"
              isDark={learn.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.footnote}>
        Glasshouse is a client-side template: progress lives in memory for
        the session and resets when the app restarts
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1 },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statRowSpaced: { marginTop: 16 },
  stat: { flex: 1, gap: 4 },
  statNote: { marginTop: 16 },
  goalBlock: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  goalHint: { marginBottom: 8 },
  goalSelect: { marginTop: 4 },
  bgBlock: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  bgControl: { marginTop: 8 },
  footnote: { textAlign: "center", paddingHorizontal: 12 },
});
