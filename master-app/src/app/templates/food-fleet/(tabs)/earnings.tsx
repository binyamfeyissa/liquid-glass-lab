import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card } from "glacia-native";

import { useFleet } from "../state";
import {
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  accentColor,
  chromeColors,
  money,
} from "../ui";

export default function EarningsScreen() {
  const fleet = useFleet();
  const week = fleet.week;
  const max = Math.max(...week.map((d) => d.amount), 1);
  const weekTotal = week.reduce((s, d) => s + d.amount, 0);
  const weekJobs = week.reduce((s, d) => s + d.jobs, 0);
  const balance = fleet.todayEarnings;
  const chrome = chromeColors(fleet.backdrop);
  const barNeutral = fleet.backdrop === "light" ? "#cfc8b8" : "#3a3a3e";

  return (
    <Screen belowTabBar title="Earnings" subtitle="This week, day by day">
      {/* Week bars — plain Views; glacia-native has no charts */}
      <View>
        <SectionTitle>Last 7 days</SectionTitle>
        <Card isDark={fleet.darkMode} padding={20}>
          <View style={styles.bars}>
            {week.map((d) => (
              <View key={d.day} style={styles.barCol}>
                <Figure variant="caption" muted>
                  {/* Axis tick: whole dollars — the exact figure is the
                      week total below; cents would collide in mono. */}
                  ${Math.round(d.amount)}
                </Figure>
                <View style={[styles.barTrack, { backgroundColor: chrome.fill }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(6, (d.amount / max) * 100)}%`,
                        backgroundColor:
                          d.day === "Today"
                            ? accentColor(fleet.backdrop)
                            : barNeutral,
                      },
                    ]}
                  />
                </View>
                <T variant="caption" muted>
                  {d.day}
                </T>
                <T variant="caption" muted>
                  {d.jobs} jobs
                </T>
              </View>
            ))}
          </View>
          <RowSeparator />
          <View style={styles.weekTotal}>
            <T variant="body" muted>
              Week total · {weekJobs} jobs
            </T>
            <Figure variant="heading">{money(weekTotal)}</Figure>
          </View>
        </Card>
      </View>

      {/* Payout card */}
      <View>
        <SectionTitle>Payout</SectionTitle>
        <Card isDark={fleet.darkMode} padding={20}>
          <T variant="label" muted>
            Available to cash out (today)
          </T>
          <Figure variant="title" style={styles.balance}>
            {money(balance)}
          </Figure>
          {fleet.cashedOut ? (
            <>
              <Badge tone="muted" isDark={fleet.darkMode} style={styles.cashBadge}>
                Cash out requested
              </Badge>
              <T variant="body" muted style={styles.cashNote}>
                Demo cash out — no money moves
              </T>
            </>
          ) : (
            <Button
              isDark={fleet.darkMode}
              accessibilityLabel="Cash out today's earnings"
              variant="filled"
              disabled={balance <= 0}
              onPress={fleet.cashOut}
              style={styles.cashButton}
            >{`Cash out ${money(balance)}`}</Button>
          )}
        </Card>
      </View>

      {/* Ratings shortcut */}
      <View>
        <SectionTitle>Your rating</SectionTitle>
        <ListCard>
          <NavRow
            title={`${fleet.averageRating.toFixed(1)} average rating`}
            description={`${fleet.ratings.length} recent customer ratings`}
            onPress={() => router.push("/templates/food-fleet/ratings")}
          />
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 172,
  },
  barCol: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  barTrack: {
    flex: 1,
    width: "72%",
    justifyContent: "flex-end",
    borderRadius: 8,
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 8 },
  weekTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  balance: { marginTop: 8, marginBottom: 12 },
  cashBadge: { alignSelf: "flex-start", marginTop: 4 },
  cashNote: { marginTop: 8 },
  cashButton: { marginTop: 4 },
});
