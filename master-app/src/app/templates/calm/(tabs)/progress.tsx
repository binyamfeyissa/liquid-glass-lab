import React from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import FlameIcon from "@hugeicons/core-free-icons/FlameIcon";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";
import TrendingUpIcon from "@hugeicons/core-free-icons/TrendingUpIcon";
import WindIcon from "@hugeicons/core-free-icons/WindIcon";

import { useStillwater } from "../state";
import { WEEK_DAYS } from "../data";
import { Figure, ListCard, RowSeparator, Screen, SectionTitle, T, accentColor } from "../ui";

/**
 * Progress: the week's minutes as bars built from plain Views
 * (glacia-native has no charts — bars are the chart), the streak, and
 * the practice history from the shared store.
 */
export default function ProgressScreen() {
  const app = useStillwater();
  const weekTotal = app.weekMinutes.reduce((a, b) => a + b, 0);
  const max = Math.max(...app.weekMinutes, app.goalMinutes, 1);
  const todayIndex = app.weekMinutes.length - 1;

  return (
    <Screen belowTabBar title="Progress" subtitle="Your minutes, streak and history">
      {/* Stats — one ledger line, figures only, each with its mark */}
      <Card isDark={app.darkMode} padding={20}>
        <View style={styles.statGrid}>
          <View style={styles.statCell}>
            <HugeiconsIcon icon={FlameIcon} size={20} color={accentColor(app.backdrop)} />
            <Figure variant="title" style={styles.statFigure}>{app.streakDays}</Figure>
            <T variant="caption" muted style={styles.statLabel}>
              day streak
            </T>
          </View>
          <View style={styles.statCell}>
            <HugeiconsIcon icon={TrendingUpIcon} size={20} color={accentColor(app.backdrop)} />
            <Figure variant="title" style={styles.statFigure}>{weekTotal}</Figure>
            <T variant="caption" muted style={styles.statLabel}>
              minutes this week
            </T>
          </View>
          <View style={styles.statCell}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color={accentColor(app.backdrop)} />
            <Figure variant="title" style={styles.statFigure}>{app.history.length}</Figure>
            <T variant="caption" muted style={styles.statLabel}>
              practices logged
            </T>
          </View>
        </View>
      </Card>

      {/* Week bars */}
      <View>
        <SectionTitle>This week</SectionTitle>
        <Card isDark={app.darkMode} padding={20}>
          <View style={styles.bars}>
            {app.weekMinutes.map((minutes, i) => (
              <View key={WEEK_DAYS[i]} style={styles.barCol}>
                <Figure variant="caption" muted style={styles.barValue}>
                  {minutes > 0 ? minutes : ""}
                </Figure>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(4, (minutes / max) * 100)}%`,
                        backgroundColor:
                          i === todayIndex
                            ? accentColor(app.backdrop)
                            : app.darkMode
                              ? "rgba(255,255,255,0.45)"
                              : "rgba(15,23,42,0.35)",
                      },
                    ]}
                  />
                </View>
                <T
                  variant="caption"
                  muted={i !== todayIndex}
                  style={[styles.barLabel, i === todayIndex && { color: accentColor(app.backdrop) }]}
                >
                  {i === todayIndex ? "Today" : WEEK_DAYS[i]}
                </T>
              </View>
            ))}
          </View>
          <T variant="caption" muted style={styles.barsFoot}>
            Goal: {app.goalMinutes} minutes a day
          </T>
        </Card>
      </View>

      {/* History */}
      <View>
        <SectionTitle>History</SectionTitle>
        <ListCard>
          {app.history.map((entry, i) => (
            <React.Fragment key={entry.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.historyRow}>
                <HugeiconsIcon
                  icon={entry.kind === "breathing" ? WindIcon : PlayIcon}
                  size={18}
                  color={accentColor(app.backdrop)}
                />
                <View style={styles.historyText}>
                  <T variant="body" numberOfLines={1}>
                    {entry.title}
                  </T>
                  <T variant="caption" muted style={styles.historySub}>
                    {entry.whenLabel}
                  </T>
                </View>
                <Figure variant="caption" muted>
                  {entry.minutes} min
                </Figure>
              </View>
            </React.Fragment>
          ))}
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: "row", gap: 16 },
  statCell: { flex: 1, alignItems: "center", gap: 4 },
  statFigure: { marginTop: 4 },
  statLabel: { marginTop: 4, textAlign: "center" },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    height: 150,
  },
  barCol: { flex: 1, alignItems: "center", height: "100%" },
  barValue: { height: 20 },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    borderRadius: 8,
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 8 },
  barLabel: { marginTop: 8 },
  barsFoot: { marginTop: 16 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  historyText: { flex: 1 },
  historySub: { marginTop: 4 },
});
