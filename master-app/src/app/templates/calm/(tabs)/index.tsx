import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card, Chip, Progress } from "glacia-native";

import { useStillwater } from "../state";
import { CATEGORIES, SESSIONS, formatClock, formatDuration, type Category } from "../data";
import {
  Artwork,
  Figure,
  ListCard,
  RowSeparator,
  SectionTitle,
  SessionRow,
  T,
  accentColor,
} from "../ui";

type Filter = Category | "All";
const FILTERS: Filter[] = ["All", ...CATEGORIES];

export default function HomeScreen() {
  const app = useStillwater();
  const [filter, setFilter] = useState<Filter>("All");

  const featured = SESSIONS.find((s) => s.featured && s.category === "Sleep") ?? SESSIONS[0];
  const continueSession = SESSIONS.find((s) => s.id === app.lastSessionId) ?? SESSIONS[0];
  const listed = SESSIONS.filter((s) => filter === "All" || s.category === filter);
  const goalPct = Math.min(100, Math.round((app.todayMinutes / app.goalMinutes) * 100));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View>
        <T variant="title">Stillwater</T>
        <T variant="body" muted style={styles.sub}>
          Meditation, breathing and sleep
        </T>
      </View>

      {/* Today's minutes + goal */}
      <Card isDark={app.darkMode} padding={20}>
        <View style={styles.statRow}>
          <View>
            <T variant="label" muted>
              Minutes today
            </T>
            <View style={styles.statLine}>
              <Figure variant="title">{app.todayMinutes}</Figure>
              <T variant="body" muted>
                {" "}
                of {app.goalMinutes} min goal
              </T>
            </View>
          </View>
          <Badge tone="muted" isDark={app.darkMode}>
            {app.streakDays}-day streak
          </Badge>
        </View>
        <Progress
          value={goalPct}
          tint={accentColor(app.backdrop)}
          accessibilityLabel="Progress toward today's goal"
          isDark={app.darkMode}
          style={styles.goalBar}
        />
        <T variant="caption" muted>
          {goalPct}% of today's goal · week so far:{" "}
          {app.weekMinutes.reduce((a, b) => a + b, 0)} minutes
        </T>
      </Card>

      {/* Featured session */}
      <View>
        <SectionTitle>Featured tonight</SectionTitle>
        <Card isDark={app.darkMode} padding={16}>
          <Artwork session={featured} height={150} />
          <T variant="heading" style={styles.featuredTitle}>
            {featured.title}
          </T>
          <T variant="body" muted style={styles.featuredBlurb}>
            {featured.blurb}
          </T>
          <View style={styles.featuredMeta}>
            <Badge tone="muted" isDark={app.darkMode}>
              {featured.category}
            </Badge>
            <Badge tone="muted" isDark={app.darkMode}>
              {formatDuration(featured.durationSec)}
            </Badge>
            <T variant="caption" muted style={styles.featuredNarrator}>
              {featured.narrator}
            </T>
          </View>
          <Button
            isDark={app.darkMode}
            accessibilityLabel={`Play ${featured.title}`}
            variant="filled"
            onPress={() => router.push(`/templates/calm/player/${featured.id}`)}
          >
            Play session
          </Button>
        </Card>
      </View>

      {/* Breathing shortcut */}
      <ListCard>
        <View style={styles.breathRow}>
          <View style={styles.breathText}>
            <T variant="body">One minute of breathing</T>
            <T variant="caption" muted style={styles.breathSub}>
              Guided patterns: 4·4·6, Box, 4·7·8
            </T>
          </View>
          <Button
            isDark={app.darkMode}
            accessibilityLabel="Start a breathing exercise"
            onPress={() => router.push("/templates/calm/breathing")}
          >
            Breathe
          </Button>
        </View>
      </ListCard>

      {/* Continue listening */}
      <View>
        <SectionTitle>Continue listening</SectionTitle>
        <ListCard>
          <SessionRow
            session={continueSession}
            onPress={() => router.push(`/templates/calm/player/${continueSession.id}`)}
          />
          <View style={styles.continueBar}>
            <Progress
              value={Math.round(
                (app.lastSessionElapsed / continueSession.durationSec) * 100,
              )}
              tint={accentColor(app.backdrop)}
              accessibilityLabel="How far through the session you are"
              isDark={app.darkMode}
            />
            <Figure variant="caption" muted style={styles.continueLabel}>
              {formatClock(app.lastSessionElapsed)} of{" "}
              {formatClock(continueSession.durationSec)} played
            </Figure>
          </View>
        </ListCard>
      </View>

      {/* Category filter + sessions */}
      <View>
        <SectionTitle>Sessions for you</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              selected={filter === f}
              onSelectedChange={() => setFilter(f)}
              isDark={app.darkMode}
            />
          ))}
        </ScrollView>
        <ListCard>
          {listed.map((session, i) => (
            <React.Fragment key={session.id}>
              {i > 0 ? <RowSeparator /> : null}
              <SessionRow
                session={session}
                onPress={() => router.push(`/templates/calm/player/${session.id}`)}
              />
            </React.Fragment>
          ))}
        </ListCard>
        {listed.length === 0 ? (
          <T variant="body" muted style={styles.empty}>
            No sessions in this category yet
          </T>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 24,
  },
  sub: { marginTop: 8 },
  statRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  statLine: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  goalBar: { marginTop: 16, marginBottom: 8 },
  featuredTitle: { marginTop: 16 },
  featuredBlurb: { marginTop: 8 },
  featuredMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  featuredNarrator: { marginLeft: 4 },
  breathRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  breathText: { flex: 1 },
  breathSub: { marginTop: 4 },
  continueBar: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  continueLabel: { marginTop: 8 },
  chipRow: { gap: 8, paddingBottom: 12, paddingRight: 4 },
  empty: { textAlign: "center", paddingVertical: 12 },
});
