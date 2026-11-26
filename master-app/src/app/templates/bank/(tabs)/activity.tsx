import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Chip, Input, colors } from "glacia-native";
import { Search } from "lucide-react-native";

import { useBank, type Category } from "../state";
import {
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  TransactionRow,
} from "../ui";

const FILTERS: ("All" | Category)[] = [
  "All",
  "Groceries",
  "Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Transfer",
  "Income",
  "Health",
  "Fun",
];

export default function ActivityScreen() {
  const bank = useBank();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bank.transactions.filter((tx) => {
      if (filter !== "All" && tx.category !== filter) return false;
      if (!q) return true;
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.detail.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      );
    });
  }, [bank.transactions, query, filter]);

  return (
    <Screen title="Activity" subtitle="Every movement, across all accounts.">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search payments, shops, people…"
        accessibilityLabel="Search activity"
        isDark={bank.darkMode}
        prefix={
          <Search
            size={18}
            color={colors[bank.darkMode ? "dark" : "light"].muted}
          />
        }
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
            isDark={bank.darkMode}
          />
        ))}
      </ScrollView>

      <View>
        <SectionTitle>
          {results.length} {results.length === 1 ? "payment" : "payments"}
        </SectionTitle>
        <ListCard>
          {results.length === 0 ? (
            <View style={styles.empty}>
              <T variant="body" muted>
                Nothing matches. Try a different search or category.
              </T>
            </View>
          ) : (
            results.map((tx, i) => (
              <React.Fragment key={tx.id}>
                {i > 0 ? <RowSeparator /> : null}
                <TransactionRow
                  tx={tx}
                  onPress={() => router.push(`/templates/bank/transaction/${tx.id}`)}
                />
              </React.Fragment>
            ))
          )}
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingRight: 4 },
  empty: { padding: 16 },
});
