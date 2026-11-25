import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Input } from "glacia-native";

import type { TxType } from "../state";
import { useWallet } from "../state";
import { ListCard, RowSeparator, Screen, SectionTitle, T, TxRow } from "../ui";

type Filter = "All" | TxType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "buy", label: "Buys" },
  { key: "sell", label: "Sells" },
  { key: "swap", label: "Swaps" },
  { key: "send", label: "Sent" },
  { key: "receive", label: "Received" },
  { key: "topup", label: "Top-ups" },
  { key: "payment", label: "Payments" },
];

export default function ActivityScreen() {
  const wallet = useWallet();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return wallet.transactions.filter((tx) => {
      if (filter !== "All" && tx.type !== filter) return false;
      if (!q) return true;
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.detail.toLowerCase().includes(q) ||
        tx.amountLabel.toLowerCase().includes(q)
      );
    });
  }, [wallet.transactions, query, filter]);

  return (
    <Screen title="Activity" subtitle="All movements across your assets">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search trades, people, assets…"
        accessibilityLabel="Search activity"
        isDark={wallet.darkMode}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            selected={filter === f.key}
            onSelectedChange={(selected) => {
              if (selected) setFilter(f.key);
            }}
            isDark={wallet.darkMode}
          />
        ))}
      </ScrollView>

      <View>
        <SectionTitle>
          {results.length} {results.length === 1 ? "movement" : "movements"}
        </SectionTitle>
        <ListCard>
          {results.length === 0 ? (
            <View style={styles.empty}>
              <T variant="body" muted>
                Nothing matches — try a different search or filter
              </T>
            </View>
          ) : (
            results.map((tx, i) => (
              <React.Fragment key={tx.id}>
                {i > 0 ? <RowSeparator /> : null}
                <TxRow tx={tx} />
              </React.Fragment>
            ))
          )}
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingVertical: 4 },
  empty: { padding: 16 },
});
