import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card, IconButton } from "glacia-native";

import { ARTICLES, BRIEFING_MARKETS } from "./data";
import { useSignal } from "./state";
import { Figure, Headline, RowSeparator, SectionTitle, T } from "./ui";

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function BriefingScreen() {
  const signal = useSignal();
  const digest = ARTICLES.filter((a) => a.briefingRank !== undefined).sort(
    (a, b) => (a.briefingRank ?? 0) - (b.briefingRank ?? 0),
  );
  const unread = digest.filter((a) => !signal.isRead(a.id));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          isDark={signal.darkMode}
          onPress={() => router.back()}
          icon={<T variant="heading">←</T>}
        />
        <View style={styles.headerText}>
          <Headline variant="title">Morning Briefing</Headline>
          <Figure variant="caption" muted>
            {todayLabel()} · Five stories, about twenty minutes
          </Figure>
        </View>
      </View>

      <Card isDark={signal.darkMode} style={styles.statusCard}>
        <T variant="body">
          {unread.length === 0
            ? "You are all caught up — every story in today's briefing is read"
            : `${unread.length} of ${digest.length} stories left in today's briefing`}
        </T>
        {unread.length > 0 ? (
          <Button
            accessibilityLabel="Read all briefing stories, starting with the first unread"
            variant="filled"
            onPress={() => router.push(`/templates/news/article/${unread[0].id}`)}
          >
            Start reading
          </Button>
        ) : null}
      </Card>

      <View>
        <SectionTitle>The digest</SectionTitle>
        <Card isDark={signal.darkMode} padding={8}>
          {digest.map((article, i) => {
            const read = signal.isRead(article.id);
            return (
              <React.Fragment key={article.id}>
                {i > 0 ? <RowSeparator /> : null}
                <Pressable
                  onPress={() => router.push(`/templates/news/article/${article.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Story ${article.briefingRank}: ${article.headline}`}
                  style={({ pressed }) => [
                    styles.digestRow,
                    pressed && {
                      backgroundColor: signal.darkMode
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <Figure variant="heading" muted style={styles.rankFigure}>
                    {article.briefingRank}
                  </Figure>
                  <View style={[styles.digestText, read && styles.readDim]}>
                    <Figure variant="caption" muted>
                      {article.topic} · {article.readMinutes} min
                    </Figure>
                    <Headline variant="body" style={styles.digestHeadline}>
                      {article.headline}
                    </Headline>
                    <T
                      variant="caption"
                      muted
                      numberOfLines={2}
                      style={styles.digestDek}
                    >
                      {article.dek}
                    </T>
                  </View>
                  {read ? (
                    <Badge tone="muted" isDark={signal.darkMode}>
                      Read
                    </Badge>
                  ) : null}
                  <T variant="heading" muted>
                    ›
                  </T>
                </Pressable>
              </React.Fragment>
            );
          })}
        </Card>
      </View>

      {/* Markets & weather — clearly labelled fixtures */}
      <View>
        <SectionTitle>Markets and weather</SectionTitle>
        <Card isDark={signal.darkMode} style={styles.marketsCard}>
          <Badge tone="muted" isDark={signal.darkMode}>
            {BRIEFING_MARKETS.label}
          </Badge>
          <View style={styles.marketRows}>
            {BRIEFING_MARKETS.rows.map((row) => (
              <View key={row.name} style={styles.marketRow}>
                <T variant="body" style={styles.marketName}>
                  {row.name}
                </T>
                <Figure variant="body">{row.value}</Figure>
                <Figure
                  variant="caption"
                  style={{
                    color: row.change.startsWith("−")
                      ? signal.darkMode
                        ? "#d97a6c"
                        : "#b3261e"
                      : signal.darkMode
                        ? "#7ba889"
                        : "#3d7a52",
                    width: 52,
                    textAlign: "right",
                  }}
                >
                  {row.change}
                </Figure>
              </View>
            ))}
          </View>
          <View style={styles.weatherRow}>
            {BRIEFING_MARKETS.weather.map((w) => (
              <View key={w.city} style={styles.weatherItem}>
                <T variant="caption" muted>
                  {w.city}
                </T>
                <Figure variant="body">{w.detail}</Figure>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Assembled by The Signal's fictional editors each morning at 6:00
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
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1, gap: 4 },
  statusCard: { gap: 12 },
  digestRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  rankFigure: {
    width: 28,
    textAlign: "center",
  },
  digestText: { flex: 1, gap: 2 },
  digestHeadline: { fontWeight: "600" },
  digestDek: { marginTop: 2 },
  readDim: { opacity: 0.55 },
  marketsCard: { gap: 16 },
  marketRows: { gap: 8 },
  marketRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  marketName: { flex: 1 },
  weatherRow: { flexDirection: "row", gap: 12 },
  weatherItem: { flex: 1, gap: 2 },
  foot: { textAlign: "center" },
});
