import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Chip, Input, SegmentedControl } from "glacia-native";

import {
  EXPENSE_CATEGORIES,
  useTally,
  type Category,
  type Transaction,
} from "../state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  TransactionRow,
  dayLabel,
  usePalette,
} from "../ui";

const FILTERS: ("All" | Category)[] = ["All", ...EXPENSE_CATEGORIES, "Income"];
const TYPE_SEGMENTS = ["All", "Expenses", "Income"];

export default function HistoryScreen() {
  const tally = useTally();
  const palette = usePalette();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [typeIndex, setTypeIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tally.transactions
      .filter((tx) => {
        if (typeIndex === 1 && tx.amount >= 0) return false;
        if (typeIndex === 2 && tx.amount <= 0) return false;
        if (filter !== "All" && tx.category !== filter) return false;
        if (!q) return true;
        return (
          tx.title.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.note ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [tally.transactions, query, filter, typeIndex]);

  const groups = useMemo(() => {
    const out: { date: string; items: Transaction[] }[] = [];
    for (const tx of results) {
      const last = out[out.length - 1];
      if (last && last.date === tx.date) last.items.push(tx);
      else out.push({ date: tx.date, items: [tx] });
    }
    return out;
  }, [results]);

  const moneyIn = results
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const moneyOut = results
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum - t.amount, 0);

  return (
    <Screen belowTabBar title="History" subtitle="Every transaction, grouped by day">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search shops, categories, notes"
        accessibilityLabel="Search history"
        isDark={tally.darkMode}
      />

      <SegmentedControl
        segments={TYPE_SEGMENTS}
        selectedIndex={typeIndex}
        onChange={setTypeIndex}
        isDark={tally.darkMode}
        accessibilityLabel="Transaction type"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            selected={filter === f}
            onSelectedChange={(selected) => {
              if (selected) setFilter(f);
            }}
            isDark={tally.darkMode}
          />
        ))}
      </ScrollView>

      {/* Totals for the current filter — one ledger line */}
      <Card isDark={tally.darkMode} padding={16}>
        <View style={styles.totalsRow}>
          <View style={styles.totalCell}>
            <T variant="label" muted>
              Money in
            </T>
            <Figure
              variant="body"
              numberOfLines={1}
              style={[styles.totalFigure, { color: palette.accent }]}
            >
              {tally.format(moneyIn)}
            </Figure>
          </View>
          <View style={styles.totalCell}>
            <T variant="label" muted>
              Money out
            </T>
            <Figure variant="body" numberOfLines={1} style={styles.totalFigure}>
              {tally.format(moneyOut)}
            </Figure>
          </View>
          <View style={styles.totalCell}>
            <T variant="label" muted>
              Net
            </T>
            <Figure
              variant="body"
              numberOfLines={1}
              style={[
                styles.totalFigure,
                moneyIn - moneyOut >= 0
                  ? { color: palette.accent }
                  : { color: palette.danger },
              ]}
            >
              {tally.formatSigned(moneyIn - moneyOut)}
            </Figure>
          </View>
        </View>
        <T variant="caption" muted style={styles.totalsNote}>
          {results.length} {results.length === 1 ? "transaction" : "transactions"}{" "}
          match the current filters
        </T>
      </Card>

      {groups.length === 0 ? (
        <ListCard>
          <View style={styles.empty}>
            <T variant="body" muted>
              Nothing matches. Try a different search, type or category
            </T>
          </View>
        </ListCard>
      ) : (
        groups.map((group) => (
          <View key={group.date}>
            <SectionTitle>{dayLabel(group.date)}</SectionTitle>
            <ListCard>
              {group.items.map((tx, i) => (
                <React.Fragment key={tx.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <TransactionRow tx={tx} />
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
  chips: { gap: 8, paddingRight: 4 },
  totalsRow: { flexDirection: "row", gap: 8 },
  totalFigure: { fontSize: 15 },
  totalCell: { flex: 1, gap: 4 },
  totalsNote: { marginTop: 12 },
  empty: { padding: 16 },
});
