import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Progress, SegmentedControl, Separator } from "glacia-native";

import { useBank } from "./state";
import { ListCard, Screen, SectionTitle, T, accentColor, money } from "./ui";

/**
 * Insights — same shape as before (the library has no charts; Progress
 * bars are the honest visualisation), but the three summary figures
 * are plain text in one row, not three glass cards. No metrics
 * invented: in, out, kept and the kept-% note only.
 */
export default function InsightsScreen() {
  const bank = useBank();
  const [monthIndex, setMonthIndex] = useState(0);
  const month = bank.insights[monthIndex];
  const saved = month.income - month.spent;
  const maxCategory = Math.max(...month.categories.map((c) => c.amount));
  const accent = accentColor(bank.backdrop);

  const summary = [
    { label: "Money in", value: month.income, green: true },
    { label: "Money out", value: month.spent, green: false },
    { label: "Kept", value: saved, green: true },
  ];

  return (
    <Screen title="Insights" subtitle="Spending by category">
      <SegmentedControl
        segments={bank.insights.map((m) => m.label.replace(" 2026", ""))}
        selectedIndex={monthIndex}
        onChange={setMonthIndex}
        isDark={bank.darkMode}
        accessibilityLabel="Month"
      />

      <View style={styles.summaryRow}>
        {summary.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 ? (
              <Separator orientation="vertical" isDark={bank.darkMode} />
            ) : null}
            <View style={styles.summaryCell}>
              <T variant="label" muted>
                {s.label}
              </T>
              <T
                variant="heading"
                style={[styles.summaryValue, s.green && { color: accent }]}
              >
                {money(s.value)}
              </T>
            </View>
          </React.Fragment>
        ))}
      </View>

      <View>
        <SectionTitle>{month.label}</SectionTitle>
        <ListCard>
          <View style={styles.bars}>
            {month.categories.map((c) => (
              <View key={c.category} style={styles.barRow}>
                <View style={styles.barHead}>
                  <T variant="body">{c.category}</T>
                  <T variant="body" muted>
                    {money(c.amount)}
                  </T>
                </View>
                <Progress
                  value={Math.round((c.amount / maxCategory) * 100)}
                  tint={accent}
                  isDark={bank.darkMode}
                  accessibilityLabel={`${c.category} spending`}
                />
              </View>
            ))}
          </View>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.note}>
        You kept {Math.round((saved / month.income) * 100)}% of what came in during{" "}
        {month.label}. Transfers between your own accounts do not count as spending.
      </T>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={bank.darkMode}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", alignItems: "stretch", gap: 12 },
  summaryCell: { flex: 1, gap: 4 },
  summaryValue: { fontVariant: ["tabular-nums"] },
  bars: { padding: 16, gap: 16 },
  barRow: { gap: 8 },
  barHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  note: { paddingHorizontal: 4 },
});
