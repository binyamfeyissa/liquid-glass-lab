import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Chip } from "glacia-native";

import { ARTICLES, TICKER, TOPICS, type Topic } from "../data";
import { useSignal } from "../state";
import {
  CoverArt,
  Figure,
  Headline,
  ListCard,
  RowSeparator,
  StoryRow,
  T,
  accentFor,
} from "../ui";

/** Ticker headline i opens the story it summarises. */
const TICKER_LINKS = ["a1", "a8", "a6", "a2", "a4", "a12", "a3"];

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TopScreen() {
  const { darkMode } = useSignal();
  const [topic, setTopic] = useState<Topic | "All">("All");

  const lead = ARTICLES.find((a) => a.lead) ?? ARTICLES[0];
  const feed = useMemo(() => {
    const sorted = [...ARTICLES].sort((a, b) => a.minutesAgo - b.minutesAgo);
    if (topic === "All") return sorted.filter((a) => a.id !== lead.id);
    return sorted.filter((a) => a.topic === topic);
  }, [topic, lead.id]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Masthead */}
      <Figure variant="caption" muted>
        {todayLabel()}
      </Figure>
      <Headline variant="title" style={styles.masthead}>
        The Signal
      </Headline>

      <View style={styles.actionRow}>
        <View style={styles.actionGrow}>
          <Button
            accessibilityLabel="Open the morning briefing"
            variant="filled"
            onPress={() => router.push("/templates/news/briefing")}
          >
            Morning briefing
          </Button>
        </View>
        <View style={styles.actionGrow}>
          <Button
            accessibilityLabel="Search stories"
            variant="glass"
            onPress={() => router.push("/templates/news/search")}
          >
            Search
          </Button>
        </View>
      </View>

      {/* Live ticker */}
      <View style={styles.tickerWrap}>
        <View style={styles.liveMark}>
          <View
            style={[
              styles.liveDot,
              { backgroundColor: accentFor(darkMode) },
            ]}
          />
          <T variant="caption" style={{ color: accentFor(darkMode) }}>
            Live
          </T>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tickerContent}
        >
          {TICKER.map((headline, i) => (
            <Pressable
              key={headline}
              onPress={() => router.push(`/templates/news/article/${TICKER_LINKS[i]}`)}
              accessibilityRole="button"
              accessibilityLabel={headline}
              style={styles.tickerItem}
            >
              <T variant="caption" numberOfLines={1}>
                {headline}
              </T>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Lead story */}
      <Pressable
        onPress={() => router.push(`/templates/news/article/${lead.id}`)}
        accessibilityRole="button"
        accessibilityLabel={lead.headline}
      >
        <Card isDark={darkMode} padding={0} style={styles.leadCard}>
          <CoverArt article={lead} height={176} large />
          <View style={styles.leadBody}>
            <View style={styles.leadKicker}>
              <T variant="caption" style={{ color: accentFor(darkMode) }}>
                Top story
              </T>
              <T variant="caption" muted>
                {lead.topic}
              </T>
            </View>
            <Headline variant="heading" style={styles.leadHeadline}>
              {lead.headline}
            </Headline>
            <T variant="body" muted>
              {lead.dek}
            </T>
            <Figure variant="caption" muted style={styles.leadMeta}>
              {lead.source} · {lead.author} · {lead.timeLabel} ·{" "}
              {lead.readMinutes} min read
            </Figure>
          </View>
        </Card>
      </Pressable>

      {/* Topic filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <Chip
          label="All"
          selected={topic === "All"}
          onPress={() => setTopic("All")}
          isDark={darkMode}
        />
        {TOPICS.map((t) => (
          <Chip
            key={t}
            label={t}
            selected={topic === t}
            onPress={() => setTopic(t)}
            isDark={darkMode}
          />
        ))}
      </ScrollView>

      {/* Feed */}
      <ListCard>
        {feed.length === 0 ? (
          <View style={styles.empty}>
            <T variant="body" muted>
              No stories in this topic yet today.
            </T>
          </View>
        ) : (
          feed.map((article, i) => (
            <React.Fragment key={article.id}>
              {i > 0 ? <RowSeparator /> : null}
              <StoryRow article={article} />
            </React.Fragment>
          ))
        )}
      </ListCard>

      <T variant="caption" muted style={styles.foot}>
        The Signal — every story is a fictional fixture written for this
        template
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 20,
  },
  masthead: { marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionGrow: { flex: 1 },
  tickerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveMark: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  tickerContent: { gap: 16, paddingRight: 8, alignItems: "center" },
  tickerItem: { maxWidth: 260 },
  leadCard: { overflow: "hidden" },
  leadBody: { padding: 20, gap: 8 },
  leadKicker: { flexDirection: "row", gap: 8 },
  leadHeadline: { lineHeight: 30 },
  leadMeta: { marginTop: 4 },
  chipRow: { gap: 8, paddingRight: 8 },
  empty: { padding: 20, alignItems: "center" },
  foot: { textAlign: "center" },
});
