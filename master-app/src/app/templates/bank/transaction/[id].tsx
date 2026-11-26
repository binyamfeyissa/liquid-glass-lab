import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button } from "glacia-native";

import { useBank } from "../state";
import { Amount, DetailRow, ListCard, RowSeparator, Screen, T, accentColor } from "../ui";

/**
 * Transaction detail — title and amount as plain text, then one
 * grouped list of label/value rows. Dispute logic unchanged: the
 * toggle flips `disputed` on the transaction in the shared store.
 */
export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bank = useBank();

  const tx = bank.transactions.find((t) => t.id === id);
  if (!tx) {
    return (
      <Screen title="Payment not found">
        <Button accessibilityLabel="Back" onPress={() => router.back()} isDark={bank.darkMode}>
          Back
        </Button>
      </Screen>
    );
  }

  const account = bank.accounts.find((a) => a.id === tx.accountId);

  return (
    <Screen title="Payment details" subtitle={tx.dateLabel}>
      <View style={styles.head}>
        <T variant="heading">{tx.title}</T>
        <Amount
          value={tx.amount}
          variant="title"
          positive
          style={styles.amount}
        />
      </View>

      <ListCard>
        <DetailRow label="Category">
          <T variant="body">{tx.category}</T>
        </DetailRow>
        <RowSeparator />
        <DetailRow label="Details">
          <T variant="body" style={styles.detailValue}>
            {tx.detail}
          </T>
        </DetailRow>
        <RowSeparator />
        <DetailRow label="Account">
          <T variant="body">
            {account ? `${account.name} ••${account.last4}` : "—"}
          </T>
        </DetailRow>
        <RowSeparator />
        <DetailRow label="Status">
          {tx.disputed ? (
            <Badge tone="destructive" isDark={bank.darkMode}>
              Disputed
            </Badge>
          ) : (
            <Badge tone="muted" isDark={bank.darkMode}>
              Completed
            </Badge>
          )}
        </DetailRow>
      </ListCard>

      <Button
        isDark={bank.darkMode}
        accessibilityLabel={tx.disputed ? "Cancel dispute" : "Dispute this payment"}
        variant={tx.disputed ? "glass" : "filled"}
        tint={accentColor(bank.backdrop)}
        onPress={() => bank.toggleDisputed(tx.id)}
      >
        {tx.disputed ? "Cancel dispute" : "Dispute this payment"}
      </Button>
      <T variant="caption" muted style={styles.note}>
        {tx.disputed
          ? "Our team reviews disputes within 2 business days. The payment stays marked here and in your activity list."
          : "Disputing flags the payment for review — use it if you don't recognise this charge."}
      </T>
      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={bank.darkMode}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4 },
  amount: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  detailValue: { textAlign: "right" },
  note: { paddingHorizontal: 4 },
});
