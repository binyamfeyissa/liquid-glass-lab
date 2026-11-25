import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button } from "glacia-native";

import { useHealth } from "./state";
import {
  dayLabel,
  formatValue,
  METRIC_META,
  type Entry,
} from "./data";
import {
  chromeColors,
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "./ui";

export default function HistoryScreen() {
  const app = useHealth();
  const chrome = chromeColors(app.backdrop);

  const groups = useMemo(() => {
    const byDay = new Map<string, Entry[]>();
    for (const entry of app.entries) {
      const list = byDay.get(entry.date) ?? [];
      list.push(entry);
      byDay.set(entry.date, list);
    }
    return [...byDay.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, entries]) => ({ date, entries: [...entries].reverse() }));
  }, [app.entries]);

  return (
    <Screen
      title="History"
      subtitle="Every entry you have logged, newest first"
    >
      <Button
        accessibilityLabel="Back"
        variant="ghost"
        onPress={() => router.back()}
        style={styles.backBtn}
      >
        Back
      </Button>

      {groups.length === 0 ? (
        <ListCard>
          <View style={styles.empty}>
            <T variant="body">Nothing logged yet</T>
            <T variant="caption" muted style={styles.sub}>
              Entries you add on the Log screen will appear here
            </T>
          </View>
        </ListCard>
      ) : (
        groups.map((group) => (
          <View key={group.date}>
            <SectionTitle>{dayLabel(group.date)}</SectionTitle>
            <ListCard>
              {group.entries.map((entry, i) => (
                <React.Fragment key={entry.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <View style={styles.entryRow}>
                    <Avatar
                      name={METRIC_META[entry.metric].label}
                      size="sm"
                      isDark={app.darkMode}
                    />
                    <View style={styles.flex1}>
                      <T variant="body">{METRIC_META[entry.metric].label}</T>
                      <T variant="caption" muted style={styles.sub}>
                        {entry.metric === "steps" || entry.metric === "water"
                          ? entry.value > 0
                            ? `Added ${formatValue(entry.metric, entry.value)}`
                            : `Removed ${formatValue(entry.metric, Math.abs(entry.value))}`
                          : "Logged entry"}
                      </T>
                    </View>
                    <Figure variant="body">
                      {formatValue(entry.metric, entry.value)}
                    </Figure>
                    <Pressable
                      onPress={() => app.deleteEntry(entry.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${METRIC_META[entry.metric].label} entry`}
                      style={({ pressed }) => [
                        styles.deleteBtn,
                        { borderColor: chrome.hairline },
                        pressed && { backgroundColor: chrome.fill },
                      ]}
                    >
                      <T variant="body" muted>
                        ✕
                      </T>
                    </Pressable>
                  </View>
                </React.Fragment>
              ))}
            </ListCard>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  sub: { marginTop: 2 },
  backBtn: { alignSelf: "flex-start" },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
