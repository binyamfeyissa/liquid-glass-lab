import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Card, Progress } from "glacia-native";

import { CURRENT_MONTH, useTally } from "../state";
import {
  CategoryBar,
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  SectionTitle,
  T,
  TransactionRow,
  usePalette,
} from "../ui";

const LAST_MONTH = "2026-10";

export default function HomeScreen() {
  const tally = useTally();
  const palette = usePalette();

  const spent = tally.spentForMonth(CURRENT_MONTH);
  const lastMonthSpent = tally.spentForMonth(LAST_MONTH);
  const deltaPct = Math.round(((spent - lastMonthSpent) / lastMonthSpent) * 100);
  const budgetPct = Math.min(100, Math.round((spent / tally.totalBudget) * 100));
  const budgetLeft = tally.totalBudget - spent;

  const topCategories = useMemo(
    () => tally.categoriesForMonth(CURRENT_MONTH).slice(0, 5),
    [tally],
  );
  const maxCategory = topCategories[0]?.amount ?? 0;

  const recent = useMemo(
    () =>
      [...tally.transactions]
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
        .slice(0, 6),
    [tally.transactions],
  );

  const topGoal = tally.goals[0];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header — the month and the person, kept quiet */}
      <View style={styles.header}>
        <Avatar name={tally.userName} size="lg" isDark={tally.darkMode} />
        <View style={styles.headerText}>
          <T variant="caption" muted>
            November 2026
          </T>
          <T variant="heading">{tally.userName}</T>
        </View>
      </View>

      {/* Month summary — the one moment: the figure and its rule */}
      <Card isDark={tally.darkMode} padding={24}>
        <T variant="label" muted>
          Spent this month
        </T>
        <Figure variant="title" style={styles.total}>
          {tally.format(spent)}
        </Figure>
        <View style={styles.deltaRow}>
          <Figure
            variant="caption"
            style={{ color: deltaPct <= 0 ? palette.accent : palette.danger }}
          >
            {deltaPct <= 0 ? "Down" : "Up"} {Math.abs(deltaPct)}%
          </Figure>
          <Figure variant="caption" muted>
            on October ({tally.format(lastMonthSpent)})
          </Figure>
        </View>
        <Progress
          value={budgetPct}
          isDark={tally.darkMode}
          tint={palette.accent}
          accessibilityLabel="Spending versus total budget"
          style={styles.budgetBar}
        />
        <Figure variant="caption" muted>
          {tally.format(budgetLeft)} left of {tally.format(tally.totalBudget)}
        </Figure>
      </Card>

      <Button
        accessibilityLabel="Add expense"
        variant="filled"
        size="lg"
        onPress={() => router.push("/templates/spend/add")}
      >
        Add expense
      </Button>

      {/* Category breakdown */}
      <View>
        <SectionTitle>Where it went</SectionTitle>
        <ListCard>
          <View style={styles.bars}>
            {topCategories.map((c) => (
              <CategoryBar
                key={c.category}
                category={c.category}
                amount={c.amount}
                max={maxCategory}
              />
            ))}
          </View>
        </ListCard>
      </View>

      {/* Goals + recurring shortcuts */}
      <View>
        <SectionTitle>Plan</SectionTitle>
        <ListCard>
          <NavRow
            title="Savings goals"
            description={
              topGoal
                ? `${topGoal.name} · ${tally.format(topGoal.saved)} of ${tally.format(topGoal.target)}`
                : "Set your first goal"
            }
            detail={`${tally.goals.length}`}
            onPress={() => router.push("/templates/spend/goals")}
          />
          <RowSeparator />
          <NavRow
            title="Recurring"
            description="Subscriptions and fixed bills"
            detail={`${tally.format(tally.recurringTotal)}/mo`}
            onPress={() => router.push("/templates/spend/recurring")}
          />
        </ListCard>
      </View>

      {/* Recent activity */}
      <View>
        <SectionTitle>Recent</SectionTitle>
        <ListCard>
          {recent.map((tx, i) => (
            <React.Fragment key={tx.id}>
              {i > 0 ? <RowSeparator /> : null}
              <TransactionRow tx={tx} />
            </React.Fragment>
          ))}
          <RowSeparator />
          <NavRow
            title="See all activity"
            description="Search, filter and totals in History"
            onPress={() => router.push("/templates/spend/(tabs)/history")}
          />
        </ListCard>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1 },
  total: { marginTop: 8, marginBottom: 8 },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  budgetBar: { marginBottom: 8 },
  bars: { padding: 16, gap: 16 },
});
