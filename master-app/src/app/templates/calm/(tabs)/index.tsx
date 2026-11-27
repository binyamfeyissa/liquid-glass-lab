import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Chip, Progress } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";
import WindIcon from "@hugeicons/core-free-icons/WindIcon";

import { useStillwater } from "../state";
import { CATEGORIES, SESSIONS, formatClock, formatDuration, type Category } from "../data";
import {
  Artwork,
  CategoryCard,
  Figure,
  FILLED_TINT,
  ListCard,
  RowSeparator,
  SectionTitle,
  SessionRow,
  T,
  accentColor,
} from "../ui";

type Filter = Category | "All";
const FILTERS: Filter[] = ["All", ...CATEGORIES];

/**
 * Home, redesigned: the day's minutes are plain type on the backdrop
 * (Apple Health, not a dashboard card); the featured session is led by
 * its artwork, not wrapped in a glass card; categories get their own
 * photo strip so each group has a different layout; the list below
 * stays a quiet grouped list. Glass is kept for the TabBar, the chips
 * and the buttons only.
 */
export default function HomeScreen() {
  const app = useStillwater();
  const [filter, setFilter] = useState<Filter>("All");

  const featured = SESSIONS.find((s) => s.featured && s.category === "Sleep") ?? SESSIONS[0];
  const continueSession = SESSIONS.find((s) => s.id === app.lastSessionId) ?? SESSIONS[0];
  const listed = SESSIONS.filter((s) => filter === "All" || s.category === filter);
  const goalPct = Math.min(100, Math.round((app.todayMinutes / app.goalMinutes) * 100));
  const accent = accentColor(app.backdrop);

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

      {/* Today's minutes — plain type on the backdrop, no card */}
      <View>
        <T variant="label" muted>
          Minutes today
        </T>
        <View style={styles.statLine}>
          <Figure style={styles.todayFigure}>{app.todayMinutes}</Figure>
          <T variant="body" muted>
            {" "}
            of {app.goalMinutes} min goal · {app.streakDays}-day streak
          </T>
        </View>
        <Progress
          value={goalPct}
          tint={accent}
          accessibilityLabel="Progress toward today's goal"
          isDark={app.darkMode}
          style={styles.goalBar}
        />
        <T variant="caption" muted>
          {goalPct}% of today's goal · week so far:{" "}
          {app.weekMinutes.reduce((a, b) => a + b, 0)} minutes
        </T>
      </View>

      {/* Featured session — artwork-led, no glass card */}
      <View>
        <SectionTitle>Featured tonight</SectionTitle>
        <Artwork session={featured} height={220} radius={20} />
        <T variant="heading" style={styles.featuredTitle}>
          {featured.title}
        </T>
        <T variant="body" muted style={styles.featuredBlurb}>
          {featured.blurb}
        </T>
        <T variant="caption" style={styles.featuredMeta}>
          <T variant="caption" style={{ color: accent }}>
            {featured.category}
          </T>
          {"  ·  "}
          {featured.narrator} · {formatDuration(featured.durationSec)} · {featured.plays} plays
        </T>
        <Button
          isDark={app.darkMode}
          accessibilityLabel={`Play ${featured.title}`}
          variant="filled"
          tint={FILLED_TINT}
          icon={<HugeiconsIcon icon={PlayIcon} size={18} color="#ffffff" />}
          onPress={() => router.push(`/templates/calm/player/${featured.id}`)}
          style={styles.playButton}
        >
          Play session
        </Button>
      </View>

      {/* Breathing shortcut */}
      <ListCard>
        <View style={styles.breathRow}>
          <HugeiconsIcon icon={WindIcon} size={22} color={accent} />
          <View style={styles.breathText}>
            <T variant="body">One minute of breathing</T>
            <T variant="caption" muted style={styles.breathSub}>
              Guided patterns: 4·4·6, Box, 4·7·8
            </T>
          </View>
          <Button
            isDark={app.darkMode}
            accessibilityLabel="Start a breathing exercise"
            variant="glass"
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
              tint={accent}
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

      {/* Browse by category — photo cards, a different layout from the list */}
      <View>
        <SectionTitle>Browse</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((category) => {
            const cover = SESSIONS.find((s) => s.category === category) ?? SESSIONS[0];
            const count = SESSIONS.filter((s) => s.category === category).length;
            return (
              <CategoryCard
                key={category}
                category={category}
                cover={cover.image}
                count={count}
                onPress={() => setFilter(category)}
              />
            );
          })}
        </ScrollView>
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
    paddingTop: 112,
    paddingBottom: 128,
    gap: 24,
  },
  sub: { marginTop: 8 },
  statLine: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  todayFigure: {
    fontSize: 44,
    lineHeight: 52,
  },
  goalBar: { marginTop: 16, marginBottom: 8 },
  featuredTitle: { marginTop: 16 },
  featuredBlurb: { marginTop: 8 },
  featuredMeta: { marginTop: 12 },
  playButton: { marginTop: 16 },
  breathRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  breathText: { flex: 1 },
  breathSub: { marginTop: 4 },
  continueBar: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  continueLabel: { marginTop: 8 },
  categoryRow: { gap: 12, paddingRight: 4 },
  chipRow: { gap: 8, paddingBottom: 12, paddingRight: 4 },
  empty: { textAlign: "center", paddingVertical: 12 },
});
