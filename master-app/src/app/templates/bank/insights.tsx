import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Progress, SegmentedControl } from "glacia-native";

import { useBank } from "./state";
import { ListCard, Screen, SectionTitle, T, accentColor, money } from "./ui";

export default function InsightsScreen() {
  const bank = useBank();
  const [monthIndex, setMonthIndex] = useState(0);
  const month = bank.insights[monthIndex];
  const saved = month.income - month.spent;
  const maxCategory = Math.max(...month.categories.map((c) => c.amount));

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
        <Card isDark={bank.darkMode} padding={16} style={styles.summaryCard}>
          <T variant="label" muted>
            Money in
          </T>
          <T variant="heading" style={[styles.income, { color: accentColor(bank.backdrop) }]}>
            {money(month.income)}
          </T>
        </Card>
        <Card isDark={bank.darkMode} padding={16} style={styles.summaryCard}>
          <T variant="label" muted>
            Money out
          </T>
          <T variant="heading">{money(month.spent)}</T>
        </Card>
        <Card isDark={bank.darkMode} padding={16} style={styles.summaryCard}>
          <T variant="label" muted>
            Kept
          </T>
          <T variant="heading" style={[styles.income, { color: accentColor(bank.backdrop) }]}>
            {money(saved)}
          </T>
        </Card>
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
        {month.label}. Transfers between your own accounts don't count as spending.
      </T>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={bank.darkMode}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryCard: { flex: 1 },
  income: { marginTop: 4, fontVariant: ["tabular-nums"] },
  bars: { padding: 16, gap: 16 },
  barRow: { gap: 8 },
  barHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  note: { paddingHorizontal: 4 },
});
