import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, SegmentedControl } from "glacia-native";

import { CURRENT_MONTH, MONTHS, monthKeyOf, useTally } from "../state";
import {
  CategoryBar,
  Figure,
  ListCard,
  Screen,
  SectionTitle,
  T,
  WeekBars,
  usePalette,
} from "../ui";

function daysCounted(monthKey: string): number {
  // The current fixture month counts up to "today" (the 22nd); past
  // months count in full.
  if (monthKey === CURRENT_MONTH) return 22;
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export default function InsightsScreen() {
  const tally = useTally();
  const palette = usePalette();
  const [monthIndex, setMonthIndex] = useState(MONTHS.length - 1);
  const month = MONTHS[monthIndex];

  const spent = tally.spentForMonth(month.key);
  const income = tally.incomeForMonth(month.key);
  const dailyAverage = spent / daysCounted(month.key);
  const categories = tally.categoriesForMonth(month.key);
  const maxCategory = categories[0]?.amount ?? 0;

  const biggest = useMemo(() => {
    const expenses = tally.transactions.filter(
      (t) => monthKeyOf(t.date) === month.key && t.amount < 0,
    );
    return expenses.reduce<(typeof expenses)[number] | null>(
      (max, t) => (max === null || t.amount < max.amount ? t : max),
      null,
    );
  }, [tally.transactions, month.key]);

  const weeks = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    for (const t of tally.transactions) {
      if (monthKeyOf(t.date) !== month.key || t.amount >= 0) continue;
      const day = Number(t.date.slice(8, 10));
      const idx = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
      buckets[idx] += -t.amount;
    }
    return buckets.map((amount, i) => ({ label: `Wk ${i + 1}`, amount }));
  }, [tally.transactions, month.key]);

  return (
    <Screen title="Insights">
      <SegmentedControl
        segments={MONTHS.map((m) => m.short)}
        selectedIndex={monthIndex}
        onChange={setMonthIndex}
        isDark={tally.darkMode}
        accessibilityLabel="Month"
      />

      {/* One ledger line: spent, came in, per day */}
      <Card isDark={tally.darkMode} padding={20}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <T variant="label" muted>
              Spent
            </T>
            <Figure
              variant="body"
              numberOfLines={1}
              style={styles.summaryValue}
            >
              {tally.format(spent)}
            </Figure>
          </View>
          <View style={styles.summaryCell}>
            <T variant="label" muted>
              Came in
            </T>
            <Figure
              variant="body"
              numberOfLines={1}
              style={[styles.summaryValue, { color: palette.accent }]}
            >
              {tally.format(income)}
            </Figure>
          </View>
          <View style={styles.summaryCell}>
            <T variant="label" muted>
              Per day
            </T>
            <Figure
              variant="body"
              numberOfLines={1}
              style={styles.summaryValue}
            >
              {tally.format(dailyAverage)}
            </Figure>
          </View>
        </View>
      </Card>

      <View>
        <SectionTitle>{month.label} by week</SectionTitle>
        <ListCard>
          <View style={styles.weekWrap}>
            <WeekBars weeks={weeks} />
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Categories</SectionTitle>
        <ListCard>
          <View style={styles.bars}>
            {categories.map((c) => (
              <CategoryBar
                key={c.category}
                category={c.category}
                amount={c.amount}
                max={maxCategory}
                caption={`${tally.format(c.amount)} · ${Math.round((c.amount / spent) * 100)}%`}
              />
            ))}
          </View>
        </ListCard>
      </View>

      {biggest ? (
        <View>
          <SectionTitle>Biggest expense</SectionTitle>
          <ListCard>
            <View style={styles.biggestRow}>
              <Avatar name={biggest.category} size="lg" isDark={tally.darkMode} />
              <View style={styles.biggestText}>
                <T variant="body">{biggest.title}</T>
                <T variant="caption" muted style={styles.biggestMeta}>
                  {biggest.category}
                  {biggest.note ? ` · ${biggest.note}` : ""}
                </T>
              </View>
              <Figure variant="heading">{tally.format(-biggest.amount)}</Figure>
            </View>
          </ListCard>
        </View>
      ) : null}

      <View style={styles.note}>
        <T variant="caption" muted>
          Kept in {month.label}
        </T>
        <Figure variant="caption" muted>
          {tally.format(income - spent)} of {tally.format(income)}
        </Figure>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCell: { flex: 1 },
  summaryValue: { marginTop: 4 },
  weekWrap: { padding: 16 },
  bars: { padding: 16, gap: 16 },
  biggestRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  biggestText: { flex: 1 },
  biggestMeta: { marginTop: 4 },
  note: {
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
});
