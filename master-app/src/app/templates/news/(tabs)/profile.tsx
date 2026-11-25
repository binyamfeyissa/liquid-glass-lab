import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Chip, Select, Switch } from "glacia-native";

import { TOPICS } from "../data";
import { FONT_STEPS, useSignal } from "../state";
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
  const signal = useSignal();

  return (
    <Screen title="Profile" subtitle="Reading, topics and settings">
      {/* Reader header */}
      <View style={styles.header}>
        <Avatar name={signal.userName} size="lg" isDark={signal.darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">{signal.userName}</T>
          <T variant="body" muted>
            Signal reader since 2023 · Free edition
          </T>
        </View>
      </View>

      {/* Reading stats — computed live from the store, as one statement */}
      <View>
        <SectionTitle>Your reading</SectionTitle>
        <ListCard>
          <View style={styles.statLine}>
            <T variant="body">Stories read</T>
            <Figure variant="body">{signal.articlesRead}</Figure>
          </View>
          <RowSeparator />
          <View style={styles.statLine}>
            <T variant="body">Estimated reading time</T>
            <Figure variant="body">{signal.minutesRead} min</Figure>
          </View>
          <RowSeparator />
          <View style={styles.statLine}>
            <T variant="body">Bookmarked</T>
            <Figure variant="body">{signal.bookmarkIds.length}</Figure>
          </View>
        </ListCard>
      </View>

      {/* Followed topics */}
      <View>
        <SectionTitle>Topics you follow</SectionTitle>
        <ListCard>
          <View style={styles.topicBox}>
            {signal.followedTopics.length === 0 ? (
              <T variant="body" muted>
                None yet — your For You feed is empty
              </T>
            ) : (
              <View style={styles.chipWrap}>
                {signal.followedTopics.map((topic) => (
                  <Chip
                    key={topic}
                    label={topic}
                    selected
                    onPress={() => signal.toggleTopic(topic)}
                    isDark={signal.darkMode}
                  />
                ))}
              </View>
            )}
            <T variant="caption" muted style={styles.topicNote}>
              {TOPICS.filter((t) => !signal.followedTopics.includes(t)).length >
              0
                ? `Not following: ${TOPICS.filter(
                    (t) => !signal.followedTopics.includes(t),
                  ).join(", ")}. Tap a chip to unfollow, or manage topics on the For You tab`
                : "You follow every topic. Tap a chip to unfollow it"}
            </T>
          </View>
        </ListCard>
      </View>

      {/* Reading preferences */}
      <View>
        <SectionTitle>Reading</SectionTitle>
        <ListCard>
          <SettingRow
            title="Article text size"
            description="The default size for story bodies — also adjustable with A− / A+ inside any article"
          >
            <Select
              value={FONT_STEPS[signal.fontStep].value}
              onValueChange={(value) => {
                const idx = FONT_STEPS.findIndex((s) => s.value === value);
                if (idx >= 0) signal.setFontStep(idx);
              }}
              options={FONT_STEPS.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
              accessibilityLabel="Article text size"
              isDark={signal.darkMode}
              style={styles.select}
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* Appearance — the three backgrounds */}
      <View>
        <SectionTitle>Appearance</SectionTitle>
        <ListCard>
          <View style={styles.bgBox}>
            <T variant="body">Background</T>
            <T variant="caption" muted>
              Graphite, broken white, or the Tahoe photo — every screen
              follows
            </T>
            <BackdropControl />
          </View>
        </ListCard>
      </View>

      {/* Notifications */}
      <View>
        <SectionTitle>Notifications</SectionTitle>
        <ListCard>
          <SettingRow
            title="Breaking news alerts"
            description="Only for stories the editors flag as major"
          >
            <Switch
              value={signal.breakingAlerts}
              onValueChange={signal.setBreakingAlerts}
              accessibilityLabel="Breaking news alerts"
              isDark={signal.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Morning briefing reminder"
            description="A nudge at 7:00 with your daily digest"
          >
            <Switch
              value={signal.briefingReminder}
              onValueChange={signal.setBriefingReminder}
              accessibilityLabel="Morning briefing reminder"
              isDark={signal.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Weekly digest"
            description="The week's most-read stories, every Sunday"
          >
            <Switch
              value={signal.weeklyDigest}
              onValueChange={signal.setWeeklyDigest}
              accessibilityLabel="Weekly digest"
              isDark={signal.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <View>
        <SectionTitle>More</SectionTitle>
        <ListCard>
          <NavRow
            title="Morning briefing"
            description="Today's five-story digest"
            onPress={() => router.push("/templates/news/briefing")}
          />
          <RowSeparator />
          <NavRow
            title="Search the edition"
            description="Headlines, topics and full text"
            onPress={() => router.push("/templates/news/search")}
          />
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        The Signal — template build, all stories are fictional fixtures
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
  headerText: { flex: 1, gap: 2 },
  statLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  topicBox: { padding: 16, gap: 12 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicNote: { lineHeight: 17 },
  bgBox: { padding: 16, gap: 12 },
  select: { minWidth: 150 },
  foot: { textAlign: "center" },
});
